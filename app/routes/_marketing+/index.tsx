import type {
	V2_MetaFunction,
} from '@vercel/remix';
import { Link } from "@remix-run/react";
import Container from '~/components/layout/Container'
import { useOptionalUser } from "~/utils";
import { Icon } from '~/components/icons';
import getSeo from '~/seo';

//export const config = { runtime: 'edge' };

export const meta: V2_MetaFunction = ({ data, matches }) => {
	if(!data) return [];
	//let { meta } = data as SerializeFrom<typeof loader>;
  const parentData = matches.flatMap((match) => match.data ?? [] );
	return [
		...getSeo({
          title: data.page.title,
			    description: data.page.excerpt,
          url: `${parentData[0].requestInfo.url}`,
        }),
	  ];
}

export default function Index() {
  const user = useOptionalUser();
  return (
    <Container>
      <main className="relative min-h-screen  sm:flex sm:items-center sm:justify-center">
        <div className="relative sm:pb-16 sm:pt-8">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
              <div className="absolute inset-0">
                <img
                  className="h-full w-full object-cover"
                  src="/hero/directed.jpg"
                  alt="Directed"
                />
                <div className="absolute inset-0 bg-[color:rgba(115, 147, 179)] mix-blend-multiply" />
              </div>
              <div className="relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pb-20 lg:pt-32">
                <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
                  <span className="block uppercase text-blue-500 drop-shadow-md">
                    Directed Stack
                  </span>
                </h1>
                <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl">
                  Check the README.md file for instructions on how to get this
                  project deployed.
                </p>
                <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                  {user ? (
                    <Link
                      to="/notes"
                      className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
                    >
                      View Notes for {user.user?.email}
                    </Link>
                  ) : (
                    <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                      <Link
                        to="/signup"
                        className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
                      >
                        Sign up
                      </Link>
                      <Link
                        to="/signin"
                        className="flex items-center justify-center rounded-md bg-blue-500 px-4 py-3 font-medium text-white hover:bg-blue-600"
                      >
                        Log In
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
  					<div className="flex flex-wrap justify-center gap-8 rounded-3xl bg-blue-100 py-4 dark:bg-blue-200">
              <div className="my-4 font-bold">Powered By:</div>
              {[
                {
                  src: "/logos/directus-logo.svg",
                  alt: "Directus",
                  href: "https://directus.io",
                },
                {
                  src: "/logos/remix.svg",
                  alt: "Remix",
                  href: "https://remix.run",
                },
                {
                  src: "https://user-images.githubusercontent.com/1500684/157764276-a516a239-e377-4a20-b44a-0ac7b65c8c14.svg",
                  alt: "Tailwind",
                  href: "https://tailwindcss.com",
                },
                {
                  src: "https://user-images.githubusercontent.com/1500684/157773063-20a0ed64-b9f8-4e0b-9d1e-0b65a3d4a6db.svg",
                  alt: "TypeScript",
                  href: "https://typescriptlang.org",
                },
              ].map((img) => (
                <a
                  key={img.href}
                  href={img.href}
                  className="flex h-16 w-32 justify-center p-1 grayscale transition hover:grayscale-0 focus:grayscale-0"
                >
                  <img alt={img.alt} src={img.src} className="object-contain" />
                </a>
              ))}
            </div>
          </div>
          <section className="text-gray-600 body-font bg-white rounded-md my-6 border-2 border-gray-200">
            <div className="container px-5 py-6 mx-auto flex items-center md:flex-row flex-col">
              <div className="flex flex-col md:pr-10 md:mb-0 mb-6 pr-0 w-full md:w-auto md:text-left text-center">
                <a href="https://github.com/freekrai/directed-stack" target="_blank" rel="noreferrer">
                  <h2 className="text-xs text-indigo-500 tracking-widest font-medium title-font mb-1">More Info</h2>
                  <h1 className="md:text-3xl text-2xl font-medium title-font text-gray-900">See More On Github</h1>
                </a>
              </div>
              <div className="flex md:ml-auto md:mr-0 mx-auto items-center flex-shrink-0 space-x-4">
                <a 
                  href="https://github.com/freekrai/directed-stack"
                  target="_blank"
                  className="bg-gray-200 inline-flex py-3 px-5 rounded-lg items-center hover:bg-gray-200 focus:outline-none" rel="noreferrer"
                >
                  <Icon name="star" />
                  <span className="ml-4 flex items-start flex-col leading-none">
                    <span className="text-xs text-gray-600 mb-1">Star</span>
                    <span className="title-font font-medium">this repo</span>
                  </span>
                </a>
                <a 
                  href="https://github.com/freekrai/directed-stack/fork"
                  target="_blank"
                  className="bg-blue-300 inline-flex py-3 px-5 rounded-lg items-center hover:bg-gray-200 focus:outline-none" rel="noreferrer"
                >
                  <Icon name="github" />
                  <span className="ml-4 flex items-start flex-col leading-none">
                    <span className="text-xs text-gray-600 mb-1">Fork</span>
                    <span className="title-font font-medium">This repo</span>
                  </span>
                </a>
              </div>
            </div>            
          </section>
          <section className="text-gray-600 body-font">
            <div className="container px-5 py-24 mx-auto">
              <div className="flex flex-col text-center w-full mb-20">
                <h2 className="text-xs text-indigo-500 tracking-widest font-medium title-font mb-1">Features built-in</h2>
                <h1 className="sm:text-3xl text-2xl font-medium title-font text-gray-900">Full-stack stack</h1>
              </div>
              <div className="flex flex-wrap -m-4">
                <div className="p-4 md:w-1/3">
                  <div className="flex rounded-lg h-full bg-gray-100 p-8 flex-col">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0">
                        <Icon name="trending-up" className="w-5 h-5" />
                      </div>
                      <h2 className="text-gray-900 text-lg title-font font-medium">Shooting Stars</h2>
                    </div>
                    <div className="flex-grow">
                      <p className="leading-relaxed text-base">Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine.</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:w-1/3">
                  <div className="flex rounded-lg h-full bg-gray-100 p-8 flex-col">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0">
                        <Icon name="user-2" className="w-5 h-5" />
                      </div>
                      <h2 className="text-gray-900 text-lg title-font font-medium">The Catalyzer</h2>
                    </div>
                    <div className="flex-grow">
                      <p className="leading-relaxed text-base">Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine.</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:w-1/3">
                  <div className="flex rounded-lg h-full bg-gray-100 p-8 flex-col">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0">
                        <Icon name="scissors" className="w-5 h-5" />
                      </div>
                      <h2 className="text-gray-900 text-lg title-font font-medium">Neptune</h2>
                    </div>
                    <div className="flex-grow">
                      <p className="leading-relaxed text-base">Blue bottle crucifix vinyl post-ironic four dollar toast vegan taxidermy. Gastropub indxgo juice poutine.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>       
      </main>
    </Container>
  );
}