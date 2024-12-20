import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTypedSelector } from '../hooks/useTypedSelector'
import { ILink, IPreviewDataItem, MediaType } from '../types/search'
import noPicture from '../assets/noPicture.jpg'
import { changeImageSizePath } from '../utils/changeImageSizePath'
import DataListManager from '../UI/DataListManager'
import { IDataAdditionalInfo, IDataTrailer, IInLists } from '../types/data'
import { fetchDataAdditionalInfo } from '../API/fetchAdditionalDataInfo'
import { formatMinToHours } from '../utils/formatMinToHours'
import { searchDataOnSites } from '../API/searchDataOnSites'
import SitesResults from '../components/SitesResults'
import Button from '../UI/Button'
import { formatVote } from '../utils/formatVote'
import { toast } from 'react-toastify'
import Loader from '../UI/Loader'
import DataNotes from '../components/DataNotes'
import { fetchDataByDataIdAndMediaType } from '../API/fetchDataByDataIdAndMediaType'
import DataCollection from '../components/DataCollection'
import { ReactComponent as StarIcon } from '../assets/star.svg'
import RecommendedData from '../components/RecommendedData'
import { fetchDataTrailer } from '../API/fetchDataTrailer'
import DataTrailer from '../components/DataTrailer'
import { fetchSeriesRuntime } from '../API/fetchSeriesRuntime'

const DataItem = () => {
	const { id, mediaType } = useParams()
	const { results } = useTypedSelector((state) => state.search)
	const { sites } = useTypedSelector((state) => state.sites)
	const { data } = useTypedSelector((state) => state.data)
	const { user } = useTypedSelector((state) => state.auth)
	const [item, setItem] = useState<IPreviewDataItem | null>(null)
	const [itemSbId, setItemSbId] = useState<number | null>(null)
	const [inLists, setInLists] = useState<IInLists>({})
	const [notes, setNotes] = useState('')
	const [additionalInfo, setAdditionalInfo] =
		useState<IDataAdditionalInfo | null>(null)
	const [infoLoading, setInfoLoading] = useState(false)
	const [sitesLoading, setSitesLoading] = useState(false)
	const [sitesResults, setSitesResults] = useState<ILink[]>([])
	const [timeLoading, setTimeLoading] = useState(0)
	const [trailer, setTrailer] = useState<IDataTrailer | null>(null)
	const [seriesRuntime, setSeriesRuntime] = useState(0)
	const isNeedToUpdateDataLinks = useRef(false)
	const navigate = useNavigate()

	const onSearchOnSitesClick = () => {
		if (!(user && user.metaData && user.metaData?.searchApiSettings)) {
			toast.error('No google api settings. Check settings')
			return
		}
		if (item && sites.length) {
			searchDataOnSites({
				searchApiSettings: user.metaData.searchApiSettings,
				dataId: item.dataId,
				mediaType: item.mediaType,
				search: item.title,
				year: item.releaseDate.slice(0, 4),
				sites,
				setSitesResults,
				setLoading: setSitesLoading,
				originalTitle: additionalInfo?.originalTitle || '',
			})
			isNeedToUpdateDataLinks.current = true
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
		window.scrollTo({
			top: 0,
			behavior: 'auto',
		})
	}, [])

	useEffect(() => {
		if (item) {
			document.title = `${item.title} - Films Lists`
		}
	}, [item])

	useEffect(() => {
		setTimeLoading(0)
		setItem(null)
		setAdditionalInfo(null)
		setInLists({})
		setNotes('')
		setSitesResults([])
		setItemSbId(null)
	}, [id])

	useEffect(() => {
		const timeLoadingTimeout = setTimeout(() => {
			setTimeLoading((prev) => prev + 500)
		}, 500)
		if (item && id && item.dataId === +id) {
			clearTimeout(timeLoadingTimeout)
			return
		}
		if (timeLoading >= 5000 && !item) {
			toast.error('No data found')
			navigate('/')
		}
		return () => {
			clearTimeout(timeLoadingTimeout)
		}
	}, [timeLoading, item, navigate, id])

	useEffect(() => {
		if (!id || !mediaType) {
			return
		}
		const findItem = results.find(
			(res) => res.dataId === +id && res.mediaType === mediaType
		)
		if (findItem) {
			setItem(findItem)
		}
	}, [id, mediaType, results])

	useEffect(() => {
		if (item && !additionalInfo) {
			const localAdInfo = localStorage.getItem(
				`additionalInfo/${item.dataId}/${item.title}`
			)
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
		if (!id || !mediaType) {
			return
		}
		const dataItem = data.find(
			(i) => i.dataId === +id && i.mediaType === mediaType
		)
		if (dataItem) {
			setItem(dataItem)
			setSitesResults(dataItem.links)
			setNotes(dataItem.notes)
			setItemSbId(dataItem.id)
			if (additionalInfo) {
				localStorage.setItem(
					`additionalInfo/${dataItem.mediaType}/${dataItem.dataId}`,
					JSON.stringify(additionalInfo)
				)
			}
		}
	}, [data, id, additionalInfo, mediaType])

	useEffect(() => {
		if (!id || !mediaType) {
			return
		}
		if (timeLoading === 500 && (+id !== item?.dataId || !item)) {
			fetchDataByDataIdAndMediaType({
				id: +id,
				mediaType: mediaType as MediaType,
				setItem,
				setAdditionalInfo,
			})
		}
	}, [timeLoading, item, id, mediaType])

	useEffect(() => {
		if (!id || !mediaType) {
			return
		}
		fetchDataTrailer({
			dataId: +id,
			mediaType: mediaType as MediaType,
			setLoading: () => {},
			setTrailer,
		})
	}, [id, mediaType])

	useEffect(() => {
		if (
			id &&
			mediaType &&
			additionalInfo?.numberOfSeasons &&
			mediaType === 'tv'
		) {
			fetchSeriesRuntime({
				id: +id,
				numberOfSeasons: additionalInfo.numberOfSeasons,
				setSeriesRuntime,
			})
		}
	}, [id, mediaType, additionalInfo])

	if (!item || infoLoading) {
		return (
			<div className='flex-1 flex justify-center items-center bg-mygray'>
				<Loader size='80' />
			</div>
		)
	}

	return (
		<>
			<div
				className={`mt-3 px-2 mb-2 flex flex-wrap justify-center md:justify-normal sm:flex-nowrap gap-x-4
        md:gap-x-6 lg:gap-x-10
      `}
			>
				<div className='self-start bg-mygray2 rounded-lg p-3 max-w-full mb-2 sm:mb-0'>
					<div className='m-auto'>
						<div className='relative select-none'>
							<a
								href={changeImageSizePath(item.fullPosterUrl, 6)}
								target='_blank'
								rel='noreferrer'
								className='relative block min-w-[280px] pb-[150%]'
							>
								<img
									src={changeImageSizePath(item.fullPosterUrl) || noPicture}
									className='absolute top-0 left-0 bg-cover w-full h-full'
									alt='poster'
									loading='lazy'
								/>
							</a>
							<div
								className={`absolute top-0 left-0 px-3 py-2 
                ${
									item.mediaType === 'movie' ? 'bg-myblue' : 'bg-pink-700'
								} text-sm select-none
              `}
							>
								{item.mediaType === 'tv' ? 'series' : item.mediaType}
							</div>
						</div>
						<DataListManager
							id={itemSbId}
							setId={setItemSbId}
							previewDataItem={item}
							inLists={inLists}
							setInLists={setInLists}
							sitesResults={sitesResults}
							notes={notes}
						/>
					</div>
				</div>
				<div className='overflow-hidden'>
					<div
						className='inline-block text-2xl xs:text-3xl mb-1 font-bold select-none hover:cursor-pointer leading-tight'
						onClick={onCopyTitle}
					>
						{item.title}
						{additionalInfo &&
							additionalInfo.originalTitle &&
							additionalInfo.originalTitle !== item.title &&
							` (${additionalInfo.originalTitle})`}
					</div>
					{additionalInfo && !!additionalInfo.tagline.length && (
						<div className='font-medium leading-tight sm:leading-normal'>
							<span className='text-zinc-400'>Slogan: </span>"
							{additionalInfo.tagline}"
						</div>
					)}
					{additionalInfo && !!additionalInfo.genres.length && (
						<div className='font-medium leading-tight sm:leading-normal'>
							<span className='text-zinc-400'>Genres: </span>
							{additionalInfo.genres.join(', ')}
						</div>
					)}
					{additionalInfo && !!additionalInfo?.countries.length && (
						<div className='font-medium leading-tight sm:leading-normal'>
							<span className='text-zinc-400'>Countries: </span>
							{additionalInfo.countries.join(', ')}
						</div>
					)}
					{item && !!item.vote && (
						<div className='flex gap-x-1 items-center font-medium'>
							<span className='text-zinc-400'>Vote: </span>
							<div>{formatVote(item.vote)}</div>
							<StarIcon className='h-6 w-6 -mt-[1px] fill-yellow-500' />
						</div>
					)}
					{((additionalInfo && !!additionalInfo.runtime) ||
						!!seriesRuntime) && (
						<div className='font-medium'>
							<span className='text-zinc-400'>Runtime: </span>
							{formatMinToHours(additionalInfo?.runtime || seriesRuntime)}
						</div>
					)}
					{item && !!item.releaseDate.length && (
						<div className='font-medium'>
							<span className='text-zinc-400'>Release date: </span>
							{item.releaseDate}
						</div>
					)}
					{additionalInfo && additionalInfo.status !== '?' && (
						<div className='font-medium'>
							<span className='text-zinc-400'>Status: </span>
							{additionalInfo.status}
						</div>
					)}
					{additionalInfo && !!additionalInfo.overview.length && (
						<div className='font-medium leading-tight sm:leading-normal'>
							<span className='text-zinc-400'>Overview: </span>
							{additionalInfo.overview}
						</div>
					)}
					<div className='hidden md:block mt-2'>
						{!!sitesResults.length || sitesLoading ? (
							<SitesResults
								loading={sitesLoading}
								setLoading={setSitesLoading}
								results={sitesResults}
								id={itemSbId}
								isNeedToUpdateDataLinks={isNeedToUpdateDataLinks}
								dataTitle={item.title}
							/>
						) : (
							<div className='inline-block mt-3'>
								<Button
									onClick={onSearchOnSitesClick}
									title='Search on sites'
								/>
							</div>
						)}
						{!!sitesResults.length && !sitesLoading && (
							<div className='inline-block mt-3'>
								<Button
									onClick={onSearchOnSitesClick}
									title='Update results'
								/>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className='block md:hidden px-2 mb-2'>
				{!!sitesResults.length || sitesLoading ? (
					<SitesResults
						loading={sitesLoading}
						setLoading={setSitesLoading}
						results={sitesResults}
						id={itemSbId}
						isNeedToUpdateDataLinks={isNeedToUpdateDataLinks}
						dataTitle={item.title}
					/>
				) : (
					<Button
						onClick={onSearchOnSitesClick}
						title='Search on sites'
						p='py-1 mt-1'
					/>
				)}
				{!!sitesResults.length && !sitesLoading && (
					<div className='mt-3'>
						<Button
							onClick={onSearchOnSitesClick}
							title='Update results'
							p='py-1'
						/>
					</div>
				)}
			</div>
			{!!Object.keys(inLists).length && (
				<div className='px-2 xs:mb-3 mb-2'>
					<DataNotes
						id={itemSbId}
						dataNotes={notes}
						setDataNotes={setNotes}
					/>
				</div>
			)}
			{trailer && <DataTrailer trailer={trailer} />}
			<DataCollection
				additionalInfo={additionalInfo}
				dataId={item.dataId}
			/>
			{id && (mediaType === 'movie' || mediaType === 'tv') && (
				<RecommendedData
					dataId={+id}
					mediaType={mediaType}
				/>
			)}
		</>
	)
}

export default DataItem
