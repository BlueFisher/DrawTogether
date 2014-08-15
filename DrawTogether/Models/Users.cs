using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;

namespace WebIM.Models {
	public class Users {
		public int id { get; set; }
		public string username { get; set; }
		public string email { get; set; }
		public string password { get; set; }
	}

	public class UsersDBContext : DbContext {
		public DbSet<Users> Users { get; set; }
	}
}