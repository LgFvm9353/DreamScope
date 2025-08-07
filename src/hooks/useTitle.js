import { useEffect } from 'react'

const useTitle = (title) => {
    useEffect(() => {
        // 服务端渲染兼容性检查
        if (typeof window !== 'undefined') {
            document.title = title
        }
    }, [title])
}

export default useTitle