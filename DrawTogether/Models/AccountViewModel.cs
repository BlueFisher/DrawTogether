using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace DT.Models {
	public class SignInModel {
		[Required(ErrorMessage = "邮箱不能为空")]
		public string Email { get; set; }

		[Required(ErrorMessage = "密码不能为空")]
		public string Password { get; set; }
		[Required(ErrorMessage = "验证码不能为空")]
		public string ValidateCode { get; set; }
		public bool RememberMe { get; set; }
	}
	public class SignUpModel {
		[Required(ErrorMessage = "用户名不能为空")]
		[StringLength(10, ErrorMessage = "用户名最多只能输入10个字符")]
		public string UserName { get; set; }

		[Required(ErrorMessage = "邮箱不能为空")]
		[RegularExpression(@"^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$", ErrorMessage = "邮箱格式错误")]
		public string Email { get; set; }

		[Required(ErrorMessage = "密码不能为空")]
		[StringLength(16, MinimumLength = 6, ErrorMessage = "密码必须在6-16个字符之间")]
		public string Password { get; set; }
		[Required(ErrorMessage = "必须再次输入密码")]
		[Compare("Password", ErrorMessage = "两次密码输入不一致")]
		public string PasswordAga { get; set; }
	}
}