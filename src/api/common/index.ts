import request from '@/axios'
import { RequestResponse } from './types'
import { any } from 'vue-types'
// 获取所有字典
export const getDictApi = () => {
  return request.get({ url: '/mock/dict/list' })
}

// 模拟获取某个字典
export const getDictOneApi = async () => {
  return request.get({ url: '/mock/dict/one' })
}

// yushandevops-embedded-hand
export const gethandApi = (topic :any) => {
  return request.get<IResponse<RequestResponse>>({
    url:`/yushandevops/embedded/hand?topic=${encodeURIComponent(topic)}`
  })
}
