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
	public delegate void WebSocketMsgReceivedEventHandler(string json,int userid);

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
			int userid = AccountController.UserInfo.ID;
			WebSocketMessageManage.AddUserSocket(userid, socket);
			try {
				while(true) {
					if(socket.State == WebSocketState.Open) {
						ArraySegment<byte> buffer = new ArraySegment<byte>(new byte[102400]);
						WebSocketReceiveResult result = await socket.ReceiveAsync(buffer, CancellationToken.None);
						string json = Encoding.UTF8.GetString(buffer.Array, 0, result.Count);
						if(!String.IsNullOrEmpty(json)) {
							Debug.WriteLine(json);
							//WebSocketMsgContainer wsmContainer = JsonConvert.DeserializeObject<WebSocketMsgContainer>(json);
							WebSocketMsgReceived(json, userid);
						}
					}
					else {
						if(!WebSocketMessageManage.LockRemoveList.Contains(userid)) {
							WebSocketMessageManage.RemoveSocket(userid);
						}
						else {
							WebSocketMessageManage.LockRemoveList.Remove(userid);
						}
						break;
					}
				}
			}
			catch(Exception e) {
				if(!WebSocketMessageManage.LockRemoveList.Contains(userid)) {
					WebSocketMessageManage.RemoveSocket(userid);
				}
				else {
					WebSocketMessageManage.LockRemoveList.Remove(userid);
				}
				Debug.WriteLine(DateTime.Now + ": " + e.Message);
			}
		}
	}

	public static class WebSocketMessageManage {
		private static Dictionary<int, WebSocket> userSocketMap = new Dictionary<int, WebSocket>();
		public static List<int> LockRemoveList = new List<int>();
		public static System.Timers.Timer timer = new System.Timers.Timer(1000);
		public static void Init() {
			DTcoreController.WebSocketMsgReceived += DTcoreController_WebSocketMsgReceived;
			timer.Elapsed += (object sender, ElapsedEventArgs e) => {
				if(userSocketMap.Count != 0 && LockRemoveList.Count == 0) {
					foreach(KeyValuePair<int, WebSocket> item in userSocketMap) {
						Debug.WriteLine(item.Key + " : " + item.Value.GetHashCode());
					}
				}
			};
			timer.Start();
		}

		static void DTcoreController_WebSocketMsgReceived(string json,int userid) {
			//MouseType type = JsonConvert.DeserializeObject<MousePenProperty>(json).type;
			SendToAll(json,userid);
		}

		public static void AddUserSocket(int userid, WebSocket ws) {
			if(!userSocketMap.Keys.Contains(userid)) {
				userSocketMap.Add(userid, ws);
			}
			else {
				string returnMessage = JsonConvert.SerializeObject(new {
					status = 0,
					errorInfo = "您被迫下线，该帐号在其他地方登陆！"
				});
				ArraySegment<byte> buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(returnMessage));
				userSocketMap[userid].SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
				userSocketMap[userid].CloseOutputAsync(WebSocketCloseStatus.InternalServerError, String.Empty, CancellationToken.None);
				LockRemoveList.Add(userid);
				userSocketMap[userid] = ws;
			}
		}
		public static void RemoveSocket(int userid) {
			userSocketMap.Remove(userid);
		}
		public static void SendToAll(string json) {
			ArraySegment<byte> buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(json));
			foreach(WebSocket ws in userSocketMap.Values) {
				ws.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
			}
		}
		public static void SendToAll(string json,int exceptId) {
			ArraySegment<byte> buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(json));
			foreach(KeyValuePair<int, WebSocket> item in userSocketMap) {
				if(item.Key != exceptId) {
					item.Value.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
				}
			}
		}
	}
}