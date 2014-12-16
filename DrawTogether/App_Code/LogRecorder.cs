using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Diagnostics;

namespace DT.App_Code {
	public static class LogRecorder {
		//private static FileStream fs = new FileStream(Environment.GetFolderPath(Environment.SpecialFolder.Personal) + @"\DTLog.log", FileMode.OpenOrCreate);
		//private static StreamWriter sw = new StreamWriter(fs);
		public static void Record(string msg) {
			string date = System.DateTime.Now.ToString();
			Debug.WriteLine(date + "	" + msg);
		}
	}
}