using Newtonsoft.Json;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using DT.Models;
using System.Diagnostics;
using System.Web.Http;
using System.Web;
using System.Net;
using System.Net.Http;
using System.Web.WebSockets;
using System.Net.WebSockets;

namespace DT.Controllers {
	public delegate void messageReceiveEventHandler(MessageProtocol mp);
	public delegate void webSocketSessionEventHandler(string username, WebSocket socket);
	public class WSChatController : ApiController {
		/// <summary>
		/// 消息收到事件
		/// </summary>
		public static event messageReceiveEventHandler messageReceive;
		public static event webSocketSessionEventHandler addWebSocketSession;
		public static event webSocketSessionEventHandler deleteWebSocketSession;
		public HttpResponseMessage Get() {
			if(HttpContext.Current.IsWebSocketRequest) {
				HttpContext.Current.AcceptWebSocketRequest(ProcessWSChat);
			}
			return new HttpResponseMessage(HttpStatusCode.SwitchingProtocols);
		}
		private async Task ProcessWSChat(AspNetWebSocketContext context) {
			WSMananger.BindEvent();
			string username = HomeController.SessionUsername;
			WebSocket socket = context.WebSocket;
			addWebSocketSession(username, socket);
			try {
				while(true) {
					if(socket.State == WebSocketState.Open) {
						ArraySegment<byte> buffer = new ArraySegment<byte>(new byte[1024]);
						WebSocketReceiveResult result = await socket.ReceiveAsync(buffer, CancellationToken.None);
						string json = Encoding.UTF8.GetString(buffer.Array, 0, result.Count);
						Debug.WriteLine(json);
						if(!String.IsNullOrEmpty(json)) {
							MessageProtocol mp = JsonConvert.DeserializeObject<MessageProtocol>(json);
							mp.username = username;
							messageReceive(mp);
						}
					}
					else {
						deleteWebSocketSession(username, socket);
						break;
					}
				}
			}
			catch {
				deleteWebSocketSession(username, socket);
			}
		}
	}

	public static class WSMananger {
		/// <summary>
		/// 储存用户名与WebSocket的键值对
		/// </summary>
		private static Dictionary<String, WebSocket> UserWsList = new Dictionary<String, WebSocket>();
		/// <summary>
		/// 移除wsList键值对锁
		/// 防止在手动关闭WebSocket连接时会自动删除wsList中的键值对
		/// </summary>
		private static List<String> RemoveLockList = new List<string>();
		private static bool isBinded = false;
		/// <summary>
		/// 绑定消息收到事件
		/// </summary>
		public static void BindEvent() {
			if(!isBinded) {
				isBinded = true;
				WSChatController.messageReceive += (mp) => {
					if(mp.type == "message") {
						sendToAll(mp,mp.username);
					}

				};
				WSChatController.addWebSocketSession += (username, socket) => {
					//如果用户重复登录
					if(UserWsList.ContainsKey(username)) {
						reSetSocket(username, socket);
					}
					else {
						UserWsList.Add(username, socket);
					}
					sendUserList(username);
					sendToAll(new MessageProtocol() {
						type = "online",
						username = username,
					}, username);
				};
				WSChatController.deleteWebSocketSession += (username, socket) => {
					if(RemoveLockList.Contains(username)) {
						RemoveLockList.Remove(username);
					}
					else {
						sendToAll(new MessageProtocol() {
							type = "offline",
							username = username,
						}, username);
						UserWsList.Remove(username);
					}
				};
				System.Timers.Timer t = new System.Timers.Timer(1000);
				t.Start();
				t.Elapsed += (s, e) => {
					foreach(KeyValuePair<String, WebSocket> p in UserWsList) {
						Debug.WriteLine(p.Key + ":" + p.Value.GetHashCode());
					}
				};
			}
		}

		/// <summary>
		/// 关闭指定用户名的socket
		/// </summary>
		/// <param name="username">指定的用户名</param>
		private static void closeSocket(string username) {
			if(UserWsList.ContainsKey(username)) {
				UserWsList[username].CloseOutputAsync(WebSocketCloseStatus.ProtocolError, String.Empty, CancellationToken.None);
			}
		}

		/// <summary>
		/// 重新设定当前用户名的WebSocket
		/// </summary>
		/// <param name="username">现有的用户名</param>
		/// <param name="socket">目标WebSocket</param>
		private static void reSetSocket(string username, WebSocket socket) {
			if(UserWsList.ContainsKey(username)) {
				sendToOne(new MessageProtocol() {
					type = "signinAgain",
					username = username,
				}, username);
				RemoveLockList.Add(username);
				UserWsList[username].CloseOutputAsync(WebSocketCloseStatus.ProtocolError, String.Empty, CancellationToken.None);
				UserWsList[username] = socket;
			}
		}

		/// <summary>
		/// 向单独一个用户发发送现有的用户列表
		/// </summary>
		/// <param name="username">该用户的用户名</param>
		public static void sendUserList(string username) {
			sendToOne(new MessageProtocol() {
				type = "userList",
				username = username,
				userlist = UserWsList.Keys.ToArray<string>()
			}, username);
		}

		/// <summary>
		/// 向单独一个用户发送信息
		/// </summary>
		/// <param name="mp">要发送的发送信息协议</param>
		/// <param name="username">该用户的用户名</param>
		public static void sendToOne(MessageProtocol mp, string username) {
			if(UserWsList.ContainsKey(username)) {
				
				JsonSerializerSettings jsonSetting = new JsonSerializerSettings();
				jsonSetting.NullValueHandling = NullValueHandling.Ignore;
				string output = JsonConvert.SerializeObject(mp, jsonSetting);
				ArraySegment<byte> buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(output));
				sendToOne(buffer, UserWsList[username]);
			}
		}
		/// <summary>
		/// 向单独一个用户发送信息
		/// </summary>
		/// <param name="buffer">要发送的字节流</param>
		/// <param name="socket">要发送的WebSocket</param>
		public static void sendToOne(ArraySegment<byte> buffer, WebSocket socket) {
			socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
		}

		/// <summary>
		/// 向所有用户发送信息
		/// </summary>
		/// <param name="mp">要发送的发送信息协议</param>
		public static void sendToAll(MessageProtocol mp) {
			sendToAll(mp, null);
		}

		/// <summary>
		/// 向所有用户发送信息
		/// </summary>
		/// <param name="mp">要发送的发送信息协议</param>
		/// <param name="exceptUsername">排除的用户名</param>
		public static void sendToAll(MessageProtocol mp, string exceptUsername) {
			JsonSerializerSettings jsonSetting = new JsonSerializerSettings();
			jsonSetting.NullValueHandling = NullValueHandling.Ignore;
			string output = JsonConvert.SerializeObject(mp, jsonSetting);
			ArraySegment<byte> buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(output));
			foreach(KeyValuePair<String, WebSocket> p in UserWsList) {
				if(exceptUsername != p.Key) {
					sendToOne(buffer, p.Value);
				}
			}
		}
	}
}
