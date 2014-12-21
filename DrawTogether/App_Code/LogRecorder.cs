using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Diagnostics;

namespace DT {
	public static class LogRecorder {
		public static void Record(string msg) {
			FileStream fs = new FileStream(Environment.GetFolderPath(Environment.SpecialFolder.Personal) + @"\DTLog.log", FileMode.Append);
			StreamWriter sw = new StreamWriter(fs);
			string date = System.DateTime.Now.ToString();
			sw.WriteLine(date + "	" + msg);
			sw.Dispose();
		}
	}
}