import { DropdownContent, DropdownMenu, DropdownTrigger } from './DropdownMenu'

import axios from 'axios'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'

type ListSourceProps = {
  className?: string
  current: number
  onChange: (id: number) => void
}

export default function ListSource({ current, onChange, className = '' }: ListSourceProps) {
  // /sources
  const {
    data,
    error,
    isFetching,
    status,
  } = useQuery({
    queryKey: ['sources'],
    queryFn: () => axios.get('/sources').then((res) => res.data),
  })

  return <DropdownMenu>
    <DropdownTrigger className={clsx("flex-1 overflow-x-hidden whitespace-nowrap min-w-0 text-ellipsis", className)}>
      {data?.find((item: any) => item.id === current)?.name || 'All'}
    </DropdownTrigger>
    <DropdownContent className="bg-white drop-shadow-lg rounded-md divide-y">
      {
        isFetching ? 'Loading...' :
          [
            {
              id: 0,
              name: 'All'
            },
            ...data || []
          ].map((source: any) => (
            <div
              key={source.id}
              className={clsx(
                'px-4 py-2 hover:bg-gray-100 cursor-pointer',
                'first:rounded-t-md last:rounded-b-md',
                'flex justify-between items-center',
                {
                  'bg-gray-100': source.id === current
                }
              )}
              onClick={() => onChange(source.id)}
            >{source.name}</div>
          ))
      }
    </DropdownContent>
  </DropdownMenu>
}
