using DT.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.WebSockets;
using System.Diagnostics;
using System.Timers;
using DT.App_Code;

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
						//if(!WebSocketMessageManage.LockRemoveList.Contains(socket))
						//	WebSocketMessageManage.RemoveSocket(socket);
						//else
						//	WebSocketMessageManage.LockRemoveList.Remove(socket);
						//break;
					}
				}
			}
			catch(Exception e) {
				//WebSocketMessageManage.RemoveSocket(socket);
				LogRecorder.Record(e.Message);
			}
		}
	}

	/*public static class WebSocketMessageManage {
		private static UsersDBContext db = new UsersDBContext();
		private static Dictionary<WebSocket, ApplicationUser> userSocketMap = new Dictionary<WebSocket, ApplicationUser>();
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
					json = JsonConvert.SerializeObject(tMouserMove);
					SendToAll(json, ws);
					break;
				case ProtJsonType.ImgBinary:
					ProtImgBinary tImgBinary = JsonConvert.DeserializeObject<ProtImgBinary>(json);
					tImgBinary.id = tUser.Id;
					tImgBinary.name = tUser.UserName;
					json = JsonConvert.SerializeObject(tImgBinary);
					SendToAll(json, ws);
					break;
				case ProtJsonType.Signin:
					string id = JsonConvert.DeserializeObject<ProtUserSignin>(json).id;
					List<ApplicationUser> list = (
						from p in db
						where p.Id == id
						select p
					).ToList();
					if(list.Count > 0) {
						AddUserSocket(ws, list[0]);
					}
					else {
						ws.CloseOutputAsync(WebSocketCloseStatus.InternalServerError, String.Empty, CancellationToken.None);
					}
					break;
			}
		}

		private static void AddUserSocket(WebSocket ws, ApplicationUser user) {
			if(!userSocketMap.Values.Contains(user)) {
				userSocketMap.Add(ws, user);
				userSignin(ws, user);
			}
			else {
				string returnMessage = JsonConvert.SerializeObject(new {
					status = 0,
					errorInfo = "您被迫下线，该帐号在其他地方登陆！"
				});
				LockRemoveList.Add(ws);
				SendToOne(returnMessage, ws);
				ws.CloseOutputAsync(WebSocketCloseStatus.InternalServerError, String.Empty, CancellationToken.None);
				userSocketMap[ws] = user;
			}
		}


		private static void SendToOne(string json, WebSocket ws) {
			try {
				ArraySegment<byte> buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(json));
				ws.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
			}
			catch(Exception e) {
				LogRecorder.Record(e.Message);
			}
		}
		private static void SendToAll(string json) {
			foreach(WebSocket ws in userSocketMap.Keys) {
				SendToOne(json, ws);
			}
		}
		private static void SendToAll(string json, WebSocket exceptWs) {
			foreach(WebSocket ws in userSocketMap.Keys) {
				if(ws != exceptWs) {
					SendToOne(json, ws);
				}
			}
		}
		private static void userSignin(WebSocket ws, ApplicationUser user) {
			//给当前登录用户发送用户列表
			ApplicationUser[] userArr = userSocketMap.Values.ToArray<ApplicationUser>();
			userArr.OrderBy(t => t.Id);
			ProtUserList ul = new ProtUserList(userArr);
			string json = JsonConvert.SerializeObject(ul);
			SendToOne(json, ws);
			//给除了当前登录用户以外的所有用户发送登录信息
			ProtUserSignin us = new ProtUserSignin() {
				id = user.Id,
				name = user.UserName,
				email = user.Email
			};
			json = JsonConvert.SerializeObject(us);
			SendToAll(json, ws);
		}
		private static void userSignout(WebSocket ws, ApplicationUser user) {
			ProtUserSignout us = new ProtUserSignout() {
				id = user.Id,
				name = user.UserName,
				email = user.Email
			};
			string json = JsonConvert.SerializeObject(us);
			SendToAll(json, ws);
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
	}*/
}