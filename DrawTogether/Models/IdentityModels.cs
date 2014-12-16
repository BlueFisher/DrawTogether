using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace DT.Models {
	public class ApplicationUser : IdentityUser {
		
	}
	public class ApplicationRole : IdentityRole {

	}

	public class ApplicationDbContext : IdentityDbContext<ApplicationUser> {
		public ApplicationDbContext()
			: base("DefaultConnection") {
		}
		public static ApplicationDbContext Create() {
			return new ApplicationDbContext();
		}
	}
}