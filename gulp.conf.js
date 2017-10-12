var resources = [
	'exports.js',
	'ui-amount.js',
	'ui-numeric.js',
	'vm-keyallow.js',
	'vm-keybord.js',
	'vm-keyfilter.js',
	'vm-number.js',
	'vm-onlynumber.js',
];
resources.unshift('prefix');
resources.push('suffix');

module.exports = {
	resources:resources,
	output:{
		cat:'vm2-utils.js',
		min:'vm2-utils.min.js'
	}
};