export const site = {
	name: 'Directed Stack',
	bio: "A Directed Stack",
};

export const getSeo = ({title, url, description, ogimage}: {title: string, url?: string, description?: string, ogimage?: string}) => {
	let seoDescription = description || site.bio;

	return [
		{ title: `${title} | ${site.name}`  },
		{ name: "description", content: seoDescription },
		{ property: "og:title", content: `${title} | ${site.name}`  },
		{ property: "og:description", content: seoDescription },
		{ property: "twitter:card", content: `summary_large_image`  },
		{ property: "twitter::title", content: `${title} | ${site.name}`  },
		{ property: "twitter::description", content: seoDescription },
	];
}

export default getSeo;