using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Diagnostics;

namespace DT.Models {
	public class ProtBase {
		public ProtBase(ProtJsonType type) { }
		public int id { get; set; }
		public string name { get; set; }
		public ProtJsonType type { get; set; }
	}
	public enum ProtJsonType {
		MouseUp = -1,
		MouseDown = 0,
		MouseMove = 1,
		ImgBinary = 2,
		UserList = 3,
		Signin = 4,
		Signout = 5
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
		int oldPt { get; set; }
		int oldMidPt { get; set; }
	}
	public class ProtMouseMove : ProtBase {
		public ProtMouseMove()
			: base(ProtJsonType.MouseMove) { }
		int midPt { get; set; }
		int oldPt { get; set; }
		int oldMidPt { get; set; }
		int penProperty { get; set; }
	}

	public class ProtUserList : ProtBase {
		public ProtUserList(User[] users)
			: base(ProtJsonType.UserList) {
			userNameList = new string[users.Length];
			for(int i = 0; i < users.Length; i++) {
				userNameList[i] = users[i].username;
			}
		}
		public string[] userNameList;
	}

	public class ProtUserSignin : ProtBase {
		public ProtUserSignin()
			: base(ProtJsonType.Signin) { }
	}
	public class ProtUserSignout : ProtBase {
		public ProtUserSignout()
			: base(ProtJsonType.Signout) { }
	}

	public class ProtImgBinary : ProtBase {
		public ProtImgBinary()
			: base(ProtJsonType.ImgBinary) { }
		public string imgBinary { get; set; }
	}
}