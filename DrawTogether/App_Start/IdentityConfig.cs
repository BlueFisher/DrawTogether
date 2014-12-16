using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using DT.Models;
using System.Collections.Generic;
using System.Linq;

namespace DT {
	public class ApplicationUserManager : UserManager<ApplicationUser> {
		public ApplicationUserManager(IUserStore<ApplicationUser> store)
			: base(store) { }
		public static ApplicationUserManager Create(IdentityFactoryOptions<ApplicationUserManager> options, IOwinContext context) {
			return new ApplicationUserManager(new UserStore<ApplicationUser>(context.Get<ApplicationDbContext>()));
		}
		public bool IsEmailDuplicated(string email) {
			foreach(ApplicationUser user in Users) {
				if(user.Email == email)
					return true;
			}
			return false;
		}
		public bool IsUserNameDuplicated(string username) {
			foreach(ApplicationUser user in Users) {
				if(user.UserName == username)
					return true;
			}
			return false;
		}
	}
	public class ApplicationSignInManager : SignInManager<ApplicationUser, string> {
		public ApplicationSignInManager(ApplicationUserManager userManager, IAuthenticationManager authenticationManager)
			: base(userManager, authenticationManager) { }
		public static ApplicationSignInManager Create(IdentityFactoryOptions<ApplicationSignInManager> options, IOwinContext context) {
			return new ApplicationSignInManager(context.GetUserManager<ApplicationUserManager>(), context.Authentication);
		}
	}

	public class ApplicationRoleManager : RoleManager<ApplicationRole> {
		public ApplicationRoleManager(IRoleStore<ApplicationRole, string> store)
			: base(store) { }
		public static ApplicationRoleManager Create(IdentityFactoryOptions<ApplicationRoleManager> options, IOwinContext context) {
			return new ApplicationRoleManager(new RoleStore<ApplicationRole>(context.Get<ApplicationDbContext>()));
		}

	}
}