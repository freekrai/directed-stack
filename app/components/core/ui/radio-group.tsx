import { RadioGroup  as HeadlessRadioGroup} from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/20/solid'

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export default function RadioGroup({label='select an item', myList, selectedList, setSelectedList}: any) {
  return (
    <HeadlessRadioGroup value={selectedList} onChange={setSelectedList}>
      <HeadlessRadioGroup.Label className="text-base font-semibold leading-6 text-gray-900">
        {label}
      </HeadlessRadioGroup.Label>

      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
        {myList.map( (row: any) => (
          <HeadlessRadioGroup.Option
            key={row.id}
            value={row}
            className={({ active }) =>
              classNames(
                active ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-300',
                'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none'
              )
            }
          >
            {({ checked, active }) => (
              <>
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <HeadlessRadioGroup.Label as="span" className="block text-md font-medium text-gray-900">
                      {row.name}
                    </HeadlessRadioGroup.Label>
                    <HeadlessRadioGroup.Description as="span" className="mt-1 flex items-center text-sm text-gray-500">
                        <p dangerouslySetInnerHTML={{
						    __html: row.description ?? "",
						}} />
                    </HeadlessRadioGroup.Description>
                    <HeadlessRadioGroup.Description as="span" className="mt-6 text-sm font-medium text-gray-900">
                    </HeadlessRadioGroup.Description>
                  </span>
                </span>
                <CheckCircleIcon
                  className={classNames(!checked ? 'invisible' : '', 'h-5 w-5 text-indigo-600')}
                  aria-hidden="true"
                />
                <span
                  className={classNames(
                    active ? 'border' : 'border-2',
                    checked ? 'border-indigo-600' : 'border-transparent',
                    'pointer-events-none absolute -inset-px rounded-lg'
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </HeadlessRadioGroup.Option>
        ))}
      </div>
    </HeadlessRadioGroup>
  )
}
