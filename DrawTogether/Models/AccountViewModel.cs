using DT.App_Code;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace DT.Models {
	public class SigninModel {
		[Required(ErrorMessage = "邮箱不能为空")]
		public string email {
			get;
			set;
		}

		private string _password;
		[Required(ErrorMessage = "密码不能为空")]
		public string password {
			get {
				return _password;
			}
			set {
				_password = Utility.getMD5(value);
			}
		}
		public bool rememberMe {
			get;
			set;
		}
	}
	public class SignupModel {
		[Required(ErrorMessage = "用户名不能为空")]
		[StringLength(10, ErrorMessage = "用户名最多只能输入10个字符")]
		public string username {
			get;
			set;
		}

		[Required(ErrorMessage = "邮箱不能为空")]
		[RegularExpression(@"^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$", ErrorMessage = "邮箱格式错误")]
		public string email {
			get;
			set;
		}

		[Required(ErrorMessage = "密码不能为空")]
		[StringLength(16, MinimumLength = 6, ErrorMessage = "密码必须在6-16个字符之间")]
		public string password {
			get;
			set;
		}
		[Required(ErrorMessage = "必须再次输入密码")]
		[Compare("password", ErrorMessage = "两次密码输入不一致")]
		public string passwordAga {
			get;
			set;
		}
	}
}