using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

namespace DT.Controllers {
	public class Util {
		public static Object GetErrorJsonFromModel(ModelStateDictionary model) {
			foreach(KeyValuePair<string, ModelState> item in model) {
				ModelErrorCollection errors = item.Value.Errors;
				if(errors.Count > 0) {
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

	public class ValidateCode {
		public string CreateValidateCode() {
			int length = 4;
			int num;
			string validateStr = "";
			Random rand = new Random(((int)DateTime.Now.Ticks & 0x0000FFFF));
			for(int i = 0; i < length; i++) {
				num = rand.Next();
				if(num % 2 == 0)
					validateStr += (char)('0' + (char)(num % 10));
				else
					validateStr += (char)('A' + (char)(num % 26));
			}
			return validateStr;
		}

		public byte[] CreateValidateGraphic(string validateCode) {
			Bitmap image = new Bitmap(validateCode.Length * 15, 22);
			Graphics g = Graphics.FromImage(image);
			try {
				//生成随机生成器
				Random random = new Random();
				//清空图片背景色
				g.Clear(Color.White);
				//画图片的干扰线
				for(int i = 0; i < 25; i++) {
					int x1 = random.Next(image.Width);
					int x2 = random.Next(image.Width);
					int y1 = random.Next(image.Height);
					int y2 = random.Next(image.Height);
					g.DrawLine(new Pen(Color.Silver), x1, y1, x2, y2);
				}
				Font font = new Font("Arial", 12, (FontStyle.Bold | FontStyle.Italic));
				LinearGradientBrush brush = new LinearGradientBrush(new Rectangle(0, 0, image.Width, image.Height),
				 Color.Blue, Color.DarkRed, 1.2f, true);
				g.DrawString(validateCode, font, brush, 3, 0);
				//画图片的前景干扰点
				for(int i = 0; i < 100; i++) {
					int x = random.Next(image.Width);
					int y = random.Next(image.Height);
					image.SetPixel(x, y, Color.FromArgb(random.Next()));
				}
				//画图片的边框线
				g.DrawRectangle(new Pen(Color.Silver), 0, 0, image.Width - 1, image.Height - 1);
				//保存图片数据
				MemoryStream stream = new MemoryStream();
				image.Save(stream, ImageFormat.Jpeg);
				//输出图片流
				return stream.ToArray();
			}
			finally {
				g.Dispose();
				image.Dispose();
			}
		}
	}
}