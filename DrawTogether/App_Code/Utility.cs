using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Security.Cryptography;
using System.Web.Mvc;

namespace DT.App_Code {
	public static class Utility {
		public static string getMD5(string strPwd) {
			MD5 md5 = MD5.Create();
			byte[] strPwdArray = System.Text.Encoding.Default.GetBytes(strPwd);//将字符编码为一个字节序列 
			byte[] md5ResultArray = md5.ComputeHash(strPwdArray);//计算data字节数组的哈希值
			md5.Clear();
			string md5Result = "";
			foreach (byte b in md5ResultArray) {
				md5Result += b.ToString("x");
			}
			return md5Result;
		}
		public static Object getErrorJson(ModelStateDictionary model) {
			foreach (KeyValuePair<string, ModelState> item in model) {
				ModelErrorCollection errors = item.Value.Errors;
				if (errors.Count > 0) {
					return new {
						status = 0,
						errorLocation = item.Key,
						errorInfo = errors[0].ErrorMessage
					};
				}
			}
			return new {
				status = 0,
				errorLocation = 0
			};
		}
	}
}