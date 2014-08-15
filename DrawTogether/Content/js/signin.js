$(document).ready(function() {
	$('#btn-signin').click(function() {
		var $this = $(this);
		var data = {
			email: $("#signinEmail").val(),
			password: $("#signinPw").val()
		};
		if (data.email == "") {
			$("#signinEmail").inputError("邮箱不能为空！");
			return;
		}
		if (data.password == "") {
			$("#signinPw").inputError("密码不能为空！");
			return;
		}
		$.ajax({
			url: 'TrySignin',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				$this.text("正在登录...");
				$this.attr('disabled', true);
			},
			success: function(json) {
				if (json.status) {
					window.location.href = "Index";
				} else {
					switch (json.errorLocation) {
						case "email":
							$("#signinEmail").inputError(json.errorInfo);
							break;
						case "password":
							$("#signinPw").inputError(json.errorInfo);
							break;
					}
				}
			},
			complete: function() {
				$this.text("登录");
				$this.removeAttr('disabled');
			}
		});
	});
	$('#btn-signup').click(function() {
		var $this = $(this);
		var data = {
			username: $("#signupNickName").val(),
			email: $("#signupEmail").val(),
			password: $("#signupPw").val(),
			passwordAga: $("#signupPwAgain").val()
		};

		if (data.username == "") {
			$("#signupNickName").inputError("用户名不能为空");
			return;
		}
		if (data.email == "") {
			$("#signupEmail").inputError("邮箱不能为空！");
			return;
		}
		if (data.password == "") {
			$("#signupPw").inputError("密码不能为空！");
			return;
		}
		if (data.passwordAga != data.password) {
			$("#signupPwAgain").inputError("两次密码输入不同！");
			return;
		}
		$.ajax({
			url: 'TrySignup',
			dataType: 'json',
			data: data,
			beforeSend: function() {
				$this.text("正在注册...");
				$this.attr('disabled', true);
			},
			success: function(json) {
				if (json.status) {
					window.location.href = "/Home/Index";
				} else {
					switch (json.errorLocation) {
						case "username":
							$("#signupNickName").inputError(json.errorInfo);
							break;
						case "email":
							$("#signupEmail").inputError(json.errorInfo);
							break;
					}
				}
			},
			complete: function() {
				$this.text("注册");
				$this.removeAttr('disabled');
			}
		});
	});
	$('.btn-toggle').click(function() {
		$(".form-signin").toggleClass('invisible');
	});
}).ajaxError(function(event, xhr, settings, thrownError) {
	$.alert({
		title: "错误！",
		content: thrownError,
		style: "danger"
	})
});

$.fn.extend({
	inputError: function(content) {
		$(this).focus();
		$(this).bind('keypress focusout', function() {
			$(this).popover('destroy')
				.parent().parent().removeClass("has-error");
		});
		if (content == undefined || content == null) {
			content = "错误";
		}
		$(this).popover({
			trigger: "manual",
			container: "body",
			placement: "top",
			content: content
		})
			.popover("show")
			.parent().parent().addClass("has-error");
		return $(this);
	}
});