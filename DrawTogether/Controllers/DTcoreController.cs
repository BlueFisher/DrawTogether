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

namespace DT.Controllers
{
    public class DTcoreController : ApiController
    {
        // GET: api/DTcore
		public HttpResponseMessage Get() {
			if (HttpContext.Current.IsWebSocketRequest) {
				HttpContext.Current.AcceptWebSocketRequest(ProcessWSChat);
			}
			return new HttpResponseMessage(HttpStatusCode.SwitchingProtocols);
		}
		private async Task ProcessWSChat(AspNetWebSocketContext context) {
			WebSocket socket = context.WebSocket;
			try {
				while (true) {
					if (socket.State == WebSocketState.Open) {
						ArraySegment<byte> buffer = new ArraySegment<byte>(new byte[1024]);
						WebSocketReceiveResult result = await socket.ReceiveAsync(buffer, CancellationToken.None);
						string json = Encoding.UTF8.GetString(buffer.Array, 0, result.Count);
						if (!String.IsNullOrEmpty(json)) {
							MessageProtocol mp = JsonConvert.DeserializeObject<MessageProtocol>(json);
						}
					} else {
						break;
					}
				}
			} catch {
			}
		}
    }
}
