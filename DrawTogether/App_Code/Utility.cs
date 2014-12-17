using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Security.Cryptography;
using System.Web.Mvc;

namespace DT.App_Code {
	public static class Utility {
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