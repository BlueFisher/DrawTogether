using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.SessionState;
using System.Web.Security;
using DT.Controllers;

namespace DT {
	public class MvcApplication : System.Web.HttpApplication {
		protected void Application_Start() {
			LogRecorder.Record("服务器启动");
			WebSocketMessageManager.Init();
			LogRecorder.Record("WebSocket初始化完毕");
			GlobalConfiguration.Configure(WebApiConfig.Register);
			RouteConfig.RegisterRoutes(RouteTable.Routes);
			LogRecorder.Record("服务器启动完成");
		}
	}
}
