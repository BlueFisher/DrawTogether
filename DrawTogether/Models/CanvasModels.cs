using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace DT.Models {
	public class CanvasModels {
		public string ImgBinary { get; set; }
		[Key]
		public string UserId { get; set; }
		[ForeignKey("UserId")]
		public virtual ApplicationUser ApplicationUser { get; set; }
	}
}