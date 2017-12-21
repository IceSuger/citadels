module.exports = {
  // 圆角输入框
  radius: {
    roomId: {
      right: true,
      mode: 'wrapped',
      title: '房间号',
      inputType: 'number',
      placeholder: '询问房主后输入'
    },
	passwd: {
		right: true,
		mode: 'wrapped',
		title: '密码',
		inputType: 'number',
		placeholder: '询问房主后输入'
	},
    excludePrice: {
      right: true,
      error: true,
      mode: 'wrapped',
      title: '不参与优惠金额',
      inputType: 'number',
      placeholder: '询问收银员后输入'
    }
  }
};
