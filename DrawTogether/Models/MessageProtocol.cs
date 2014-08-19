using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DT.Models {
	public class MessageProtocol {
		/// <summary>
		/// 发送数据的类型
		/// </summary>
		public string type { get; set; }
		/// <summary>
		/// 发送方的用户名
		/// </summary>
		public string username { get; set; }
		/// <summary>
		/// 要发送的信息
		/// </summary>
		public string message { get; set; }
		public string date = DateTime.Now.ToShortDateString();
		public string time = DateTime.Now.ToLongTimeString();
		/// <summary>
		/// 要发送的用户列表
		/// </summary>
		public string[] userlist { get; set; }
	}
}