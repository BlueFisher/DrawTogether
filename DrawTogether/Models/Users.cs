using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations;

namespace DT.Models {
	public class User {
		public User() {
			signupDateTime = DateTime.Now;
		}
		[Key]
		public int ID {
			get;
			set;
		}
		public string username {
			get;
			set;
		}
		public string email {
			get;
			set;
		}
		public string password {
			get;
			set;
		}
		public DateTime signupDateTime {
			get;
			set;
		}
	}

	public class UsersDBContext : DbContext {
		public DbSet<User> Users {
			get;
			set;
		}
	}
}