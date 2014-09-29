using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DT.Models {
	public enum MouseType {
		MouseUp = -1,
		MouseDown = 0,
		MouseMove = 1
	}
	public class MousePenProperty {
		public MouseType type { get; set; }
	}
}