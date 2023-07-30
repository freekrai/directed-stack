
export default function PageHeader({title, description, children}: {title: string, description?: string, children?: any}) {
    return (
      <div className="w-full mb-20">
        <div className="flex flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">{title}</h1>
            <div className="h-1 w-20 bg-indigo-500 rounded"></div>
          </div>
          <div className="flex sm:mt-0">
            {children}
          </div>
        </div>
        {description && <p className="lg:w-1/2 w-full leading-relaxed text-gray-500">
          {description}
        </p>}
      </div>
    )
}

export function PageHeader2({title, subtitle="", children}: any) {
  return (
      <div 
        className="bg-gray-100 border-b border-gray-200 p-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8"
      >
          <div className="flex-1 min-w-0">
              <h1 className="text-lg font-medium leading-6 text-gray-900 capitalize sm:truncate">{title}</h1>
              <div className="h-1 w-20 bg-indigo-500 rounded"></div>
              {subtitle && <p className="text-md capitalize" dangerouslySetInnerHTML={{ __html: subtitle }} />}
          </div>
          <div className="mt-4 flex sm:mt-0 sm:ml-4">
              {children}
          </div>
      </div>
  )
}