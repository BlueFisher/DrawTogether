using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Diagnostics;

namespace DT.Models {
	public class ProtBase {
		public ProtBase(ProtJsonType type) {
			this.type = type;
		}
		public string id { get; set; }
		public string name { get; set; }
		public ProtJsonType type { get; set; }
	}
	public enum ProtJsonType {
		MouseUp = 0,
		MouseDown = 1,
		MouseMove = 2,
		ImgBinary = 3,
		RequestImgBinary = 4,
		UserList = 5,
		Signin = 6,
		SigninSucceed = 7,
		Signout = 8,
		Error = 9
	}
	public class ProtJsonTypeCheck {
		public ProtJsonType type { get; set; }
	}

	public class ProtMouseUp : ProtBase {
		public ProtMouseUp()
			: base(ProtJsonType.MouseUp) { }
	}
	public class ProtMouseDown : ProtBase {
		public ProtMouseDown()
			: base(ProtJsonType.MouseDown) { }
		public object oldPt { get; set; }
		public object oldMidPt { get; set; }
		public object penProperty { get; set; }
	}
	public class ProtMouseMove : ProtBase {
		public ProtMouseMove()
			: base(ProtJsonType.MouseMove) { }
		public object midPt { get; set; }
		public object oldPt { get; set; }
		public object oldMidPt { get; set; }
		public object penProperty { get; set; }
	}

	public class ProtUserList : ProtBase {
		public ProtUserList(ApplicationUser[] users)
			: base(ProtJsonType.UserList) {
			userInfoList = new object[users.Length];
			for(int i = 0; i < users.Length; i++) {
				userInfoList[i] = new {
					id = users[i].Id,
					email = users[i].Email,
					name = users[i].UserName
				};
			}
		}
		public object[] userInfoList;
	}

	public class ProtUserSignin : ProtBase {
		public ProtUserSignin()
			: base(ProtJsonType.Signin) { }
		public string email { get; set; }
	}
	public class ProtUserSignout : ProtBase {
		public ProtUserSignout()
			: base(ProtJsonType.Signout) { }
		public string email { get; set; }
	}

	public class ProtImgBinary : ProtBase {
		public ProtImgBinary()
			: base(ProtJsonType.ImgBinary) { }
		public string imgBinary { get; set; }
	}
	public class ProtRequestImgBinary : ProtBase {
		public ProtRequestImgBinary()
			: base(ProtJsonType.RequestImgBinary) { }
	}
	public class ProtError : ProtBase {
		public ProtError(string err)
			: base(ProtJsonType.Error) {
			this.errorInfo = err;
		}
		public string errorInfo { get; set; }
	}
}