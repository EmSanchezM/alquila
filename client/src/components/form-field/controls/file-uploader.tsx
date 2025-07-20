import { convertFileToUrl } from '@/lib/utils/convert-file-to-url'
import {FC, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'

interface FileUploaderProps {
  files: File[] | undefined,
  onChange: (files: File[]) => void
}

const FileUploader: FC<FileUploaderProps> = ({ files, onChange }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange(acceptedFiles)
  }, [])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div {...getRootProps()} className="file-upload">
      <input {...getInputProps()} />
      {
        files && files.length > 0 ? (
          <img 
            src={convertFileToUrl(files[0])}
            width={1000}
            height={1000}
            alt="uploaded image"
            className='max-h-[400px] overflow-hidden object-cover'
          />
        ) : 
        (
          <>
            <img 
              src=""
              width={400}
              height={400}
              alt="upload"
            />
            <div className='file-upload-label'>
              <p className="text-14-regular">
                <span className='text-green-500'>
                  Click to upload
                </span> or drag and drop
              </p>
              <p>
                SVG, PNG, JPG, GIF (max 800x400)
              </p>
            </div>
          </>
        )
      }
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </div>
  )
}

export default FileUploader