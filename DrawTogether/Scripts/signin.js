$(document).ready(function() {
	$('#changeValidateCode').click(function() {
		var $this = $(this);
		$this.find('img').attr('src', '/Account/GetValidateCode?' + Math.random());
	})
	$('#btn-signin').click(function() {
		var $this = $(this);
		var data = {
			email: $('#signinEmail').val(),
			password: $('#signinPwd').val(),
			validatecode: $('#signinValidateCode').val(),
			rememberMe: $('#signinRememberMe').prop('checked')
		};
		if (data.email.length == 0) {
			$('#signinEmail').inputError('邮箱不能为空！');
			return;
		}
		if (data.password.length == 0) {
			$('#signinPwd').inputError('密码不能为空！');
			return;
		}
		if (data.validatecode.length == 0) {
			$('#signinValidateCode').inputError('验证码不能为空！');
			return;
		}
		$.ajax({
			url: 'Signin',
			dataType: 'json',
			type: 'Post',
			data: data,
			beforeSend: function() {
				$this.text('正在登录...');
				$this.attr('disabled', true);
			},
			success: function(json) {
				if (json.status) {
					window.location.href = json.redirectUrl;
				} else {
					switch (json.errorLocation) {
						case 'email':
							$('#signinEmail').inputError(json.errorInfo);
							break;
						case 'password':
							$('#signinPwd').inputError(json.errorInfo);
							break;
						case 'validatecode':
							$('#signinValidateCode').inputError(json.errorInfo);
							break;
					}
				}
			},
			complete: function() {
				$this.text('登录');
				$this.removeAttr('disabled');
			}
		});
	});
	$('#btn-signup').click(function() {
		var $this = $(this);
		var data = {
			username: $('#signupNickName').val(),
			email: $('#signupEmail').val(),
			password: $('#signupPwd').val(),
			passwordAga: $('#signupPwdAgain').val()
		};
		if (data.username.length == 0) {
			$('#signupNickName').inputError('用户名不能为空');
			return;
		}
		if (data.email.length == 0) {
			$('#signupEmail').inputError('邮箱不能为空！');
			return;
		}
		if (data.password.length == 0) {
			$('#signupPwd').inputError('密码不能为空！');
			return;
		}
		if (data.passwordAga != data.password) {
			$('#signupPwdAgain').inputError('两次密码输入不同！');
			return;
		}
		$.ajax({
			url: 'Signup',
			dataType: 'json',
			type: 'Post',
			data: data,
			beforeSend: function() {
				$this.text('正在注册...');
				$this.attr('disabled', true);
			},
			success: function(json) {
				if (json.status) {
					window.location.href = json.redirectUrl;
				} else {
					switch (json.errorLocation) {
						case 'username':
							$('#signupNickName').inputError(json.errorInfo);
							break;
						case 'email':
							$('#signupEmail').inputError(json.errorInfo);
							break;
						case 'password':
							$('#signupPwd').inputError(json.errorInfo);
							break;
						case 'passwordAga':
							$('#signupPwdAgain').inputError(json.errorInfo);
							break;
					}
				}
			},
			complete: function() {
				$this.text('注册');
				$this.removeAttr('disabled');
			}
		});
	});
	$('.btn-toggle').click(function() {
		$('.form-signin').toggleClass('invisible');
	});
}).ajaxError(function(event, xhr, settings, thrownError) {
	$.alert({
		title: '连接服务器错误！',
		content: thrownError,
		style: 'danger'
	})
});

$.fn.extend({
	inputError: function(content) {
		var $this = $(this);
		$this.focus();
		$this.bind('keypress focusout', function() {
			$this.popover('destroy')
				.parent().parent().removeClass('has-error');
		});
		if (content == undefined || content == null) {
			content = '错误';
		}
		$this.popover({
				trigger: 'manual',
				container: 'body',
				placement: 'top',
				content: content
			})
			.popover('show')
			.parent().parent().addClass('has-error');
		return $this;
	}
});