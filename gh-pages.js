var ghpages = require('gh-pages');

ghpages.publish(
	'docs', // path to public directory
	{
		branch: 'gh-pages',
		repo: 'https://github.com/eritsugu-nakagawa/svelte-minecraft-enchant-cost-calc.git', // Update to point to your repository
		user: {
			name: 'eritsugu-nakagawa', // update to use your name
			email: 'eritsugu1990@gmail.com' // Update to use your email
		},
		dotfiles: true
	},
	() => {
		console.log('Deploy Complete!');
	}
);
