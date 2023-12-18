import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTypedSelector } from '../hooks/useTypedSelector'
import { ILink, ISearchDataItem } from '../types/search'
import noPicture from '../assets/noPicture.jpg'
import { changeImageSizePath } from '../utils/changeImageSizePath'
import DataListManager from '../UI/DataListManager'
import { IDataAdditionalInfo } from '../types/data'
import { fetchDataAdditionalInfo } from '../API/fetchAdditionalDataInfo'
import { formatMinToHours } from '../utils/formatMinToHours'
import { searchDataOnSites } from '../API/searchDataOnSites'
import Sites from '../components/Sites'
import Button from '../UI/Button'
import { formatVote } from '../utils/formatVote'
import { toast } from 'react-toastify'
import Loader from '../UI/Loader'

const DataItem = () => {
  const { id } = useParams()
  const { results } = useTypedSelector(state => state.search)
  const { sites } = useTypedSelector(state => state.sites)
  const { data } = useTypedSelector(state => state.data)
  const [item, setItem] = useState<ISearchDataItem | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState<IDataAdditionalInfo | null>(null)
  const [infoLoading, setInfoLoading] = useState(false)
  const [sitesLoading, setSitesLoading] = useState(false)
  const [sitesResults, setSitesResults] = useState<ILink[]>([])

  const onSearchOnSitesClick = () => {
    if (item && !sitesResults.length && sites.length) {
      searchDataOnSites({
        search: item.title,
        year: item.releaseDate.slice(0, 4),
        sites,
        // sites: [sites[1]],
        setSitesResults,
        setLoading: setSitesLoading,
      })
    }
  }

  const onCopyTitle = () => {
    if (item) {
      navigator.clipboard.writeText(item.title).then(() => {
        toast.success('Title copied!')
      })
    }
  }

  useEffect(() => {
    if (!id) {
      return;
    }
    const findItem = results.find(r => r.dataId === +id)
    if (findItem) {
      setItem(findItem)
    }
  }, [id, results])

  useEffect(() => {
    if (item && !additionalInfo) {
      const localAdInfo = localStorage.getItem('additionalInfo' + item.dataId)
      if (localAdInfo) {
        setAdditionalInfo(JSON.parse(localAdInfo))
      } else {
        fetchDataAdditionalInfo({
          dataId: item.dataId,
          mediaType: item.mediaType,
          setAdditionalInfo,
          setLoading: setInfoLoading,
        })
      }
    }
  }, [item, additionalInfo])

  useEffect(() => {
    const dataItem = data.find(i => i.dataId === (id ? +id : 0))
    if (dataItem) {
      setItem(dataItem)
      setSitesResults(dataItem.links)
      if (additionalInfo) {
        localStorage.setItem('additionalInfo' + dataItem.dataId, JSON.stringify(additionalInfo))
      }
    }
  }, [data, id, additionalInfo])

  if (!item || infoLoading) {
    return (
      <div className='flex-1 flex justify-center items-center bg-mygray'>
        <Loader size='80' />
      </div>
    )
  }

  return (
    <div className='mt-3 px-2 flex gap-x-10'>
      <div className='bg-mygray2 rounded-md p-4'>
        <div className='w-[342px] m-auto'>
          <div className='relative'>
            <img
              src={changeImageSizePath(item.fullPosterUrl) || noPicture}
              className='w-[342px] h-[513px]'
              alt="poster"
            />
            <div className={`absolute top-0 left-0 px-3 py-2 
            ${item.mediaType === 'movie' ? 'bg-myblue' : 'bg-pink-700'} text-sm select-none
          `}>
              {item.mediaType === 'tv' ? 'series' : item.mediaType}
            </div>
          </div>
          <DataListManager
            searchDataItem={item}
            sitesResults={sitesResults}
          />
        </div>
      </div>
      <div>
        <div
          className='inline-block text-3xl font-medium mb-3 select-none hover:cursor-pointer'
          onClick={onCopyTitle}
        >
          {item.title}
        </div>
        {additionalInfo && !!additionalInfo.genres.length && (
          <div className='font-medium'>
            <span className='text-zinc-400'>Genres: </span>{additionalInfo.genres.join(', ')}
          </div>
        )}
        <div className='font-medium'>
          <span className='text-zinc-400'>Vote: </span>
          {formatVote(item.vote)}
        </div>
        {additionalInfo && !!additionalInfo.runtime && (
          <div className='font-medium'>
            <span className='text-zinc-400'>Runtime: </span>{formatMinToHours(additionalInfo.runtime)}
          </div>
        )}
        <div className='font-medium'>
          <span className='text-zinc-400'>Release date:</span> {item.releaseDate}
        </div>
        {additionalInfo && additionalInfo.overview && (
          <div className='font-medium'>
            <span className='text-zinc-400'>Overview: </span>{additionalInfo.overview}
          </div>
        )}
        {!!sitesResults.length || sitesLoading ?
          <Sites
            loading={sitesLoading}
            results={sitesResults}
          />
          : (
            <div>
              <Button
                onClick={onSearchOnSitesClick}
                title='Search on sites'
                className='mt-6'
              />
            </div>
          )
        }
      </div>
    </div>
  )
}

export default DataItem