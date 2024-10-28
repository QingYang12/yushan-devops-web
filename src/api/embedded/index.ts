import request from '@/axios'


export const handpushApi = (params: any) => {
  return request.get({ url: '/yushandevops/embedded/handpush', params })
}
export const handApi = (params: any) => {
  return request.get({ url: '/yushandevops/embedded/hand', params })
}