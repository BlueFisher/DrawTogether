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
						if(!WebSocketMessageManage.LockRemoveList.Contains(socket)) {
							WebSocketMessageManage.RemoveSocket(socket);
						}
						else {
							WebSocketMessageManage.LockRemoveList.Remove(socket);
						}
						break;
					}
				}
			}
			catch(Exception e) {
				//if(!WebSocketMessageManage.LockRemoveList.Contains(socket)) {
					WebSocketMessageManage.RemoveSocket(socket);
				//}
				//else {
				//	WebSocketMessageManage.LockRemoveList.Remove(socket);
				//}
				Debug.WriteLine(DateTime.Now + ": " + e.Message);
			}
		}
	}

	public static class WebSocketMessageManage {
		private static UsersDBContext db = new UsersDBContext();
		private static Dictionary<WebSocket, User> userSocketMap = new Dictionary<WebSocket, User>();
		public static List<WebSocket> LockRemoveList = new List<WebSocket>();
		public static System.Timers.Timer timer = new System.Timers.Timer(1000);
		public static void Init() {
			DTcoreController.WebSocketMsgReceived += DTcoreController_WebSocketMsgReceived;
			timer.Elapsed += (object sender, ElapsedEventArgs e) => {
				if(userSocketMap.Count != 0 && LockRemoveList.Count == 0) {
					foreach(KeyValuePair<WebSocket, User> item in userSocketMap) {
						Debug.WriteLine(item.Value.username + " : " + item.Key.GetHashCode());
					}
				}
			};
			timer.Start();
		}

		static void DTcoreController_WebSocketMsgReceived(string json, WebSocket ws) {
			User tUser = userSocketMap[ws];
			ProtJsonType type = JsonConvert.DeserializeObject<ProtJsonTypeCheck>(json).type;
			switch(type) {
				//case ProtJsonType.MouseDown:
				case ProtJsonType.MouseMove:
				//case ProtJsonType.MouseUp:
					ProtMouseMove tMouserMove = JsonConvert.DeserializeObject<ProtMouseMove>(json);
					tMouserMove.id = tUser.ID;
					tMouserMove.name = tUser.username;
					json = JsonConvert.SerializeObject(tMouserMove);
					SendToAll(json, ws);
					break;
				case ProtJsonType.ImgBinary:
					ProtImgBinary tImgBinary = JsonConvert.DeserializeObject<ProtImgBinary>(json);
					tImgBinary.id = tUser.ID;
					tImgBinary.name = tUser.username;
					SendToAll(json,ws);
					break;
				case ProtJsonType.Signin:
					int id = JsonConvert.DeserializeObject<ProtUserSignin>(json).id;
					List<User> list = (
						from p in db.Users
						where p.ID == id
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

		public static void AddUserSocket(WebSocket ws, User user) {
			if(!userSocketMap.Values.Contains(user)) {
				userSocketMap.Add(ws, user);
				SendUserNameList(ws);
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
		public static void RemoveSocket(WebSocket ws) {
			userSocketMap.Remove(ws);
			SendUserNameList();
		}
		
		public static void SendToOne(string json, WebSocket ws){
			ArraySegment<byte> buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(json));
			ws.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
		}
		public static void SendToAll(string json) {
			foreach(WebSocket ws in userSocketMap.Keys) {
				SendToOne(json, ws);
			}
		}
		public static void SendToAll(string json, WebSocket exceptWs) {
			foreach(WebSocket ws in userSocketMap.Keys) {
				if(ws != exceptWs) {
					SendToOne(json, ws);
				}
			}
		}
		private static void SendUserNameList(WebSocket ws) {
			ProtUserList ul = new ProtUserList(userSocketMap.Values.ToArray<User>());
			string json = JsonConvert.SerializeObject(ul);
			SendToOne(json, ws);
		}
	}
}