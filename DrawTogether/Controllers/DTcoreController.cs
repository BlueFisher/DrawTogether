using DT.App_Code;
using DT.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using System.Web;
using System.Web.Http;
using System.Web.WebSockets;

namespace DT.Controllers {
	public delegate void WebSocketMsgReceivedEventHandler(string json, WebSocket ws);

	public class DTcoreController : ApiController {
		public static event WebSocketMsgReceivedEventHandler WebSocketMsgReceived;
		// GET: api/DTcore
		public HttpResponseMessage Get() {
			if(HttpContext.Current.IsWebSocketRequest) {
				HttpContext.Current.AcceptWebSocketRequest(ProcessWSChat);
			}
			return new HttpResponseMessage(HttpStatusCode.SwitchingProtocols);
		}
		private async Task ProcessWSChat(AspNetWebSocketContext context) {
			WebSocket socket = context.WebSocket;
			try {
				string receivedMessage = "";
				while(true) {
					if(socket.State == WebSocketState.Open) {
						ArraySegment<byte> buffer = new ArraySegment<byte>(new byte[1024]);
						WebSocketReceiveResult result = await socket.ReceiveAsync(buffer, CancellationToken.None);
						string json = Encoding.UTF8.GetString(buffer.Array, 0, result.Count);

						if(!String.IsNullOrEmpty(json)) {
							receivedMessage += json;
							if(json.EndsWith("}")) {
								WebSocketMsgReceived(receivedMessage, socket);
								receivedMessage = "";
							}
						}
					}
					else {
						if(!WebSocketMessageManager.LockRemoveList.Contains(socket))
							WebSocketMessageManager.RemoveSocket(socket);
						else
							WebSocketMessageManager.LockRemoveList.Remove(socket);
						break;
					}
				}
			}
			catch(Exception e) {
				WebSocketMessageManager.RemoveSocket(socket);
				LogRecorder.Record(e.Message);
			}
		}
	}

	public static class WebSocketMessageManager {
		private static ApplicationDbContext db = new ApplicationDbContext();
		/// <summary>
		/// 用户与WebSocket键值对
		/// </summary>
		private static Dictionary<WebSocket, ApplicationUser> userSocketMap = new Dictionary<WebSocket, ApplicationUser>();
		/// <summary>
		/// 被锁定无法移除的用户列表
		/// </summary>
		public static List<WebSocket> LockRemoveList = new List<WebSocket>();
		private static System.Timers.Timer timer = new System.Timers.Timer(1000);


		private static void DTcoreController_WebSocketMsgReceived(string json, WebSocket ws) {
			ApplicationUser tUser = null;
			if(userSocketMap.Keys.Contains<WebSocket>(ws)) {
				tUser = userSocketMap[ws];
			}
			ProtJsonType type = JsonConvert.DeserializeObject<ProtJsonTypeCheck>(json).type;
			switch(type) {
				case ProtJsonType.MouseDown:
				case ProtJsonType.MouseUp:
				case ProtJsonType.MouseMove:
					ProtMouseMove tMouserMove = JsonConvert.DeserializeObject<ProtMouseMove>(json);
					tMouserMove.id = tUser.Id;
					tMouserMove.name = tUser.UserName;
					SendToAll(tMouserMove, ws);
					break;
				case ProtJsonType.ImgBinary:
					ProtImgBinary tImgBinary = JsonConvert.DeserializeObject<ProtImgBinary>(json);

					CanvasModels cm = new CanvasModels {
						UserId = tUser.Id,
						ImgBinary = tImgBinary.imgBinary
					};
					var tEntry = db.Entry(cm);
					tEntry.State = EntityState.Modified;
					db.SaveChanges();
					tEntry.State = EntityState.Detached;

					tImgBinary.id = tUser.Id;
					tImgBinary.name = tUser.UserName;
					SendToAll(tImgBinary, ws);
					break;
				case ProtJsonType.Signin:
					string id = JsonConvert.DeserializeObject<ProtUserSignin>(json).id;
					ApplicationUser user = db.Users.Find(id);
					if(user != null) {
						AddUserSocket(ws, user);
					}
					else {
						ws.CloseOutputAsync(WebSocketCloseStatus.InternalServerError, String.Empty, CancellationToken.None);
					}
					break;
			}
		}

		private static void AddUserSocket(WebSocket ws, ApplicationUser user) {
			try {
				if(!userSocketMap.Values.Contains(user)) {
					userSocketMap.Add(ws, user);
					userSignin(ws, user);
				}
				else {
					LockRemoveList.Add(ws);
					SendToOne(new {
						status = 0,
						errorInfo = "您被迫下线，该帐号在其他地方登陆！"
					}, ws);
					ws.CloseOutputAsync(WebSocketCloseStatus.InternalServerError, String.Empty, CancellationToken.None);
					userSocketMap[ws] = user;
				}
			}
			catch(Exception e) {
				Debug.WriteLine(e);
			}
		}


		private static void SendToOne(object jsonObj, WebSocket ws) {
			try {
				string json = JsonConvert.SerializeObject(jsonObj);
				ArraySegment<byte> buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(json));
				ws.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
			}
			catch(Exception e) {
				LogRecorder.Record(e.Message);
			}
		}
		private static void SendToAll(object jsonObj) {
			foreach(WebSocket ws in userSocketMap.Keys) {
				SendToOne(jsonObj, ws);
			}
		}
		private static void SendToAll(object jsonObj, WebSocket exceptWs) {
			foreach(WebSocket ws in userSocketMap.Keys) {
				if(ws != exceptWs) {
					SendToOne(jsonObj, ws);
				}
			}
		}
		private static void userSignin(WebSocket ws, ApplicationUser user) {
			//给当前登录用户发送用户列表
			ApplicationUser[] userArr = userSocketMap.Values.ToArray<ApplicationUser>();
			userArr.OrderBy(t => t.Id);
			ProtUserList ul = new ProtUserList(userArr);
			SendToOne(ul, ws);
			//给除了当前登录用户以外的所有用户发送登录信息
			ProtUserSignin us = new ProtUserSignin() {
				id = user.Id,
				name = user.UserName,
				email = user.Email
			};
			SendToAll(us, ws);
		}
		private static void userSignout(WebSocket ws, ApplicationUser user) {
			ProtUserSignout us = new ProtUserSignout() {
				id = user.Id,
				name = user.UserName,
				email = user.Email
			};
			SendToAll(us, ws);
		}

		public static void Init() {
			DTcoreController.WebSocketMsgReceived += DTcoreController_WebSocketMsgReceived;

			timer.Elapsed += (object sender, ElapsedEventArgs e) => {
				try {
					if(userSocketMap.Count != 0 && LockRemoveList.Count == 0) {
						foreach(KeyValuePair<WebSocket, ApplicationUser> item in userSocketMap) {
							Debug.WriteLine(item.Value.UserName + " : " + item.Key.GetHashCode());
						}
					}
				}
				catch { }
			};
			//timer.Start();
		}
		public static void RemoveSocket(WebSocket ws) {
			userSignout(ws, userSocketMap[ws]);
			userSocketMap.Remove(ws);
		}
	}
}