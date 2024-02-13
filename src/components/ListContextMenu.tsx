import React, { MouseEvent, useEffect, useState } from 'react'
import { IList } from '../types/lists'
import { useTypedSelector } from '../hooks/useTypedSelector'
import { moveDataFromListToList } from '../API/moveDataFromListToList'
import { useActions } from '../hooks/useActions'
import Confirmation from '../UI/Confirmation'
import { deleteList } from '../API/deleteList'
import Loader from '../UI/Loader'

interface ListContextMenuProps {
  list: IList,
  menuPositionX: number,
  menuPositionY: number,
  closeContextMenu: () => void,
  dataCountInList: number,
}

const ListContextMenu = ({ list, menuPositionX, menuPositionY, closeContextMenu, dataCountInList }: ListContextMenuProps) => {
  const { lists } = useTypedSelector(state => state.lists)
  const { fetchData, fetchLists } = useActions()
  const [isMoveListsVisible, setIsMoveListsVisible] = useState(false)
  const [isCopyListsVisible, setIsCopyListsVisible] = useState(false)
  const [isDeleteListConfirmationVisible, setIsDeleteListConfirmationVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMoveListsVisible = () => {
    setIsMoveListsVisible(prev => !prev)
    setIsCopyListsVisible(false)
  }

  const handleCopyListsVisible = () => {
    setIsCopyListsVisible(prev => !prev)
    setIsMoveListsVisible(false)
  }

  const handleDeleteListConfirmationVisible = () => {
    setIsDeleteListConfirmationVisible(prev => !prev)
  }

  const onBgClick = (e: MouseEvent) => {
    e.stopPropagation()
    closeContextMenu()
  }

  const onMoveListData = async (toListId: number) => {
    await moveDataFromListToList({
      method: 'move',
      fromListId: list.id,
      toListId,
      setLoading,
    })
    fetchData()
    fetchLists()
    closeContextMenu()
  }

  const onCopyListData = async (toListId: number) => {
    await moveDataFromListToList({
      method: 'copy',
      fromListId: list.id,
      toListId,
      setLoading,
    })
    fetchData()
    fetchLists()
    closeContextMenu()
  }

  const onDeleteList = async () => {
    await deleteList(list.id, setLoading)
    fetchLists()
    fetchData()
    setIsDeleteListConfirmationVisible(false)
    closeContextMenu()
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  if (loading) {
    return (
      <div className='fixed z-20 top-0 left-0 w-full min-h-full flex justify-center items-center bg-black bg-opacity-80'>
        <Loader size='80' />
      </div>
    )
  }

  return (
    <div
      className='fixed z-20 top-0 left-0 w-full min-h-full cursor-pointer bg-black bg-opacity-80 select-none'
      onClick={(e) => onBgClick(e)}
    >
      <div
        style={{
          position: 'fixed',
          top: menuPositionY + 15,
          left: menuPositionX,
        }}
        className={`z-20 bg-black py-2 px-4 cursor-default  border-white border-[1px]`}
        onClick={e => e.stopPropagation()}
      >
        <div
          className='text-lg max-w-[320px] font-bold truncate cursor-help'
          title={list.name}
        >
          Menu for "{list.name}"
        </div>
        <div className='flex flex-col gap-y-1 relative'>
          {dataCountInList > 0 && (
            <>
              <div
                className='underline cursor-pointer select-none font-medium'
                onClick={handleMoveListsVisible}
              >
                Move data to...
              </div>
              <div
                className='underline cursor-pointer select-none font-medium'
                onClick={handleCopyListsVisible}
              >
                Copy data to...
              </div>
              {isMoveListsVisible && (
                <div className='absolute z-30 top-0 left-full bg-mygray2 translate-x-5'>
                  <div className={`
                    flex-col gap-y-1 h-full min-w-[170px] max-h-[300px] overflow-y-auto px-3 py-1 
                  `}
                  >
                    {lists.filter(l => l.id !== list.id).map(l => (
                      <div
                        key={l.id}
                        className='cursor-pointer truncate max-w-[320px]'
                        title={l.name}
                        onClick={() => onMoveListData(l.id)}
                      >
                        {l.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isCopyListsVisible && (
                <div className='absolute z-30 top-7 left-full bg-mygray2 translate-x-5'>
                  <div className={`
                    flex-col gap-y-1 h-full min-w-[170px] max-h-[300px] overflow-y-auto px-3 py-1 
                  `}
                  >
                    {lists.filter(l => l.id !== list.id).map(l => (
                      <div
                        key={l.id}
                        className='cursor-pointer truncate max-w-[320px]'
                        title={l.name}
                        onClick={() => onCopyListData(l.id)}
                      >
                        {l.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <div
            className='underline cursor-pointer select-none text-myred font-medium'
            onClick={handleDeleteListConfirmationVisible}
          >
            Delete list
          </div>
        </div>
        {isDeleteListConfirmationVisible && (
          <Confirmation
            title='If you delete this list, any unsaved data associated with it will be permanently removed.'
            onConfirm={onDeleteList}
            onClose={handleDeleteListConfirmationVisible}
          />
        )}
      </div>
    </div>
  )
}

export default ListContextMenu