import React, { MouseEvent, useState, ChangeEvent } from 'react'
import { ReactComponent as CloseIcon } from '../assets/cancel.svg'
import { IList } from '../types/lists'
import Button from './Button'
import Input from './Input'
import { createList } from '../API/createList'
import { useTypedSelector } from '../hooks/useTypedSelector'
import { useActions } from '../hooks/useActions'

interface SaveToListsModalProps {
  handleClose: (e: MouseEvent<HTMLDivElement>) => void,
  additionalLists: IList[],
}

const SaveToListsModal = ({ handleClose, additionalLists }: SaveToListsModalProps) => {
  const { user } = useTypedSelector(state => state.auth)
  const { fetchLists } = useActions()
  const [isCreateNewList, setIsCreateNewList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListNameError, setNewListNameError] = useState('')

  const onNewListNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const name = value.trim()
    if (!name.length) {
      setNewListNameError('Field is required')
    } else {
      setNewListNameError('')
    }
    setNewListName(value)
  }

  const onCreateNewListClick = () => {
    setIsCreateNewList(true)
  }

  const onCreateNewList = async () => {
    if (user) {
      const orderNum = additionalLists.length ? (additionalLists[additionalLists.length - 1].orderNum + 1) : 3
      await createList(newListName, orderNum, user.id)
      fetchLists()
    }
    setIsCreateNewList(false)
  }

  return (
    <div
      className='fixed z-40 top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center'
      onClick={e => handleClose(e)}
    >
      <div
        className='bg-mygray3 px-8 py-4 rounded-xl opacity-100 text-base min-w-[400px]'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex justify-between items-center gap-x-10 mb-6'>
          <div className='font-bold text-2xl'>Save to...</div>
          <div onClick={handleClose}><CloseIcon className='fill-white h-6 w-6' /></div>
        </div>
        <div className='flex flex-col gap-y-2 mb-6'>
          {!!additionalLists.length && additionalLists.map(list => (
            <div key={list.id} className='flex gap-x-4 items-center'>
              <input type='checkbox' />
              <div className='flex-1'>{list.name}</div>
              <div>Edit</div>
            </div>
          ))}
        </div>
        {isCreateNewList && (
          <div className='flex items-start gap-x-4 mb-4'>
            <Input
              error={newListNameError}
              name='List name'
              onInputChange={onNewListNameChange}
              isFieldDirty={true}
              placeholder='Enter list name'
              value={newListName}
              className='min-w-[200px]'
              titleBg='bg-bg2'
              py='py-2'
            />
            <Button
              onClick={onCreateNewList}
              title='Save'
              className='py-[6px]'
            />
          </div>
        )}
        <div
          className='flex items-center gap-x-2'
          onClick={onCreateNewListClick}>
          <CloseIcon className='rotate-45 fill-white h-4 w-4' />
          <div className='text-lg'>Create new list</div>
        </div>
      </div>
    </div>
  )
}

export default SaveToListsModal