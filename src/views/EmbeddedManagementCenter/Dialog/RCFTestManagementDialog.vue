<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { ElRadio, ElRadioGroup, ElTag,ElSwitch ,ElText} from 'element-plus'
import { getTableListApi, saveTableApi, delTableListApi } from '@/api/table'
import { useTable } from '@/hooks/web/useTable'
import { TableData } from '@/api/table/types'
import { ref, unref, reactive } from 'vue'
import Write from './components/Write.vue'
import Detail from './components/Detail.vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { handpushApi ,handApi ,handImageApi ,startmodelApi} from '@/api/embedded'
import  {nextTick} from 'vue'
const ids = ref<string[]>([])

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getTableListApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  },
  fetchDelApi: async () => {
    const res = await delTableListApi(unref(ids))
    return !!res
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
const { getList, getElTableExpose, delList } = tableMethods
//定义区域  
const state = reactive({
  videoStatus:false,
  modelStatus:false,
  selfMoveTestStatus:false,
  intervalId: null as number | null,
  imageUrl: null as string | null ,
  imageUrl2:'/public/logo1.png'
});
const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

const getDeviceType = () => {
  const ua = navigator.userAgent
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return 'mobile' // 手机
  } else {
    return 'pc' // PC
  }
}
const handleDeviceChange = () => {
  //console.log('当前选择的设备类型:', value)
  // 在这里可以执行其他逻辑，比如请求接口、更新视图等
  //const deviceType = ref('mobile') // 默认值可以是 'mobile' 或 'pc'
  const phoneDiv = document.getElementById('phoneDiv');
  const pcDiv = document.getElementById('pcDiv');

  if (deviceType.value === 'mobile') {
    phoneDiv && (phoneDiv.style.display = 'block');
    pcDiv && (pcDiv.style.display = 'none');
  } else {
    phoneDiv && (phoneDiv.style.display = 'none');
    pcDiv && (pcDiv.style.display = 'block');
  }
  

}
// 👇 定义 deviceType 并初始化为 'mobile'
let deviceType = ref('mobile') // 默认值可以是 'mobile' 或 'pc'


deviceType = ref(getDeviceType())


handleDeviceChange();


const { t } = useI18n()

const crudSchemas = reactive<CrudSchema[]>([
  {
    field: 'selection',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    table: {
      type: 'selection'
    }
  },
  {
    field: 'index',
    label: t('tableDemo.index'),
    type: 'index',
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    }
  },
  {
    field: 'title',
    label: t('tableDemo.title'),
    search: {
      component: 'Input'
    },
    form: {
      component: 'Input',
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24
    }
  },
  {
    field: 'author',
    label: t('tableDemo.author'),
    search: {
      hidden: true
    }
  },
  {
    field: 'display_time',
    label: t('tableDemo.displayTime'),
    search: {
      hidden: true
    },
    form: {
      component: 'DatePicker',
      componentProps: {
        type: 'datetime',
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    }
  },
  {
    field: 'importance',
    label: t('tableDemo.importance'),
    search: {
      hidden: true
    },
    form: {
      component: 'Select',
      componentProps: {
        style: {
          width: '100%'
        },
        options: [
          {
            label: '重要',
            value: 3
          },
          {
            label: '良好',
            value: 2
          },
          {
            label: '一般',
            value: 1
          }
        ]
      }
    },
    detail: {
      slots: {
        default: (data: any) => {
          return (
            <ElTag
              type={
                data.importance === 1 ? 'success' : data.importance === 2 ? 'warning' : 'danger'
              }
            >
              {data.importance === 1
                ? t('tableDemo.important')
                : data.importance === 2
                  ? t('tableDemo.good')
                  : t('tableDemo.commonly')}
            </ElTag>
          )
        }
      }
    }
  },
  {
    field: 'pageviews',
    label: t('tableDemo.pageviews'),
    search: {
      hidden: true
    },
    form: {
      component: 'InputNumber',
      value: 0
    }
  },
  {
    field: 'content',
    label: t('exampleDemo.content'),
    search: {
      hidden: true
    },
    table: {
      show: false
    },
    form: {
      component: 'Editor',
      colProps: {
        span: 24
      }
    },
    detail: {
      span: 24,
      slots: {
        default: (data: any) => {
          return <div innerHTML={data.content}></div>
        }
      }
    }
  },
  {
    field: 'action',
    width: '260px',
    label: t('tableDemo.action'),
    search: {
      hidden: true
    },
    form: {
      hidden: true
    },
    detail: {
      hidden: true
    },
    table: {
      slots: {
        default: (data: any) => {
          return (
            <>
              <BaseButton type="primary" onClick={() => action(data.row, 'edit')}>
                {t('exampleDemo.edit')}
              </BaseButton>
              <BaseButton type="success" onClick={() => action(data.row, 'detail')}>
                {t('exampleDemo.detail')}
              </BaseButton>
              <BaseButton type="danger" onClick={() => delData(data.row)}>
                {t('exampleDemo.del')}
              </BaseButton>
            </>
          )
        }
      }
    }
  }
])

// @ts-ignore
const { allSchemas } = useCrudSchemas(crudSchemas)

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref<TableData | null>(null)
const actionType = ref('')

const AddAction = () => {
  dialogTitle.value = t('exampleDemo.add')
  currentRow.value = null
  dialogVisible.value = true
  actionType.value = ''
}

const delLoading = ref(false)

const delData = async (row: TableData | null) => {
  const elTableExpose = await getElTableExpose()
  ids.value = row ? [row.id] : elTableExpose?.getSelectionRows().map((v: TableData) => v.id) || []
  delLoading.value = true
  await delList(unref(ids).length).finally(() => {
    delLoading.value = false
  })
}

const action = (row: TableData, type: string) => {
  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.detail')
  actionType.value = type
  currentRow.value = row
  dialogVisible.value = true
}
const handpush = async (topic: string, group: string,message: string,type: string) => {
  let params = {
    topic: topic,
    group: group,
    message: message,
    type: type
  }
  await handpushApi(params);
}
const hand = async (topic: string, group: string, type: string) => {
  let params = {
    topic: topic,
    group: group,
    type:type
  }
  let res:any=await handApi(params);
  console.log("res: ",res);
}
const handAll = async (topic: string, group: string, type: string) => {
  let params = {
    topic: topic,
    group: group,
    type:type
  }
  for(var i=0;i<20;i++){
    let res:any=await handApi(params);
    console.log("res: ",res);
  }
  
}


const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    const res = await saveTableApi(formData)
      .catch(() => {})
      .finally(() => {
        saveLoading.value = false
      })
    if (res) {
      dialogVisible.value = false
      currentPage.value = 1
      getList()
    }
  }
}

const startPolling = () => {
      if (state.intervalId === null) {
        state.intervalId = window.setInterval(() => {
          let params = {}
          handImageApi(params).then(res => {
            console.log('API Response:', res)
            const blob =  res.data
            state.imageUrl = URL.createObjectURL(blob)
            let container = document.getElementById('testimg');
            if(container){
              container.src=state.imageUrl;
              container.style.display='block';
            }
            
            nextTick(() => {
              //console.log("imageUrl: ",state.imageUrl);
              
            });  
          }).catch(err => {
            console.error('API Error:', err)
          })
        }, 1000) // 每隔 3 秒请求一次
      }
    }

    const stopPolling = () => {
      if (state.intervalId !== null) {
        window.clearInterval(state.intervalId)
        state.intervalId = null
        let container = document.getElementById('testimg');
        if(container){
          container.style.display='none';
        }
            
      }
    }
const videoChange = (val) => {
    state.videoStatus = val;
    console.log("state.videoStatus: ",state.videoStatus);
    if (state.videoStatus) {
        startPolling()
      } else {
        stopPolling()
      }
}
const modelChange = (val) => {
    state.modelStatus = val;
    console.log("state.modelStatus: ",state.modelStatus);
    console.log(typeof state.modelStatus);
    if (state.modelStatus==true) {
      let params = {
          modeltype: 'true'
        }
         startmodelApi(params);
    } else {
      let params = {
         modeltype: 'false'
        }
         startmodelApi(params);
    }
}
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function  selfMoveTestChange  (val) {
  state.selfMoveTestStatus = val;
  console.log("state.selfMoveTestStatus: ",state.selfMoveTestStatus);
  if (state.selfMoveTestStatus) {
        //自动展示
        //B X    8  7
        //左右    5  6
        //BX     8  7
        //BX     8  7
        // 右 左    6   5
        while(state.selfMoveTestStatus) {
          const actions = ['8','7','5','6','8','7','8','7','6','5'];
          for (let action of actions) {
                if (!state.selfMoveTestStatus) break;
                handpush('testtopic', 'testtopicg', action, 'c');
                console.log('selfMoveTest  action ', action);
                await delay(1000); // 等待1秒
            }
            
        }
  } else {
    
  }
}

</script>

<template>
  <ContentWrap>
    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />
    <ElRadioGroup v-model="deviceType" @change="handleDeviceChange">
      <ElRadio label="mobile">手机</ElRadio>
      <ElRadio label="pc">PC</ElRadio>
    </ElRadioGroup>
    <div class="mb-10px">
      <ElText class="ml-8px!">摄像头：</ElText>
      <ElSwitch type="primary"  v-model="state.videoStatus"      @change="videoChange" active-text="Open" inactive-text="Close"      />
    </div>
    <div class="mb-10px">
      <ElText class="ml-8px!">模型自动操控：</ElText>
      <ElSwitch type="primary"  v-model="state.modelStatus"      @change="modelChange" active-text="Open" inactive-text="Close"      />
    </div>
    <div class="mb-10px">
      <ElText class="ml-8px!">自动操控演示测试：</ElText>
      <ElSwitch type="primary"  v-model="state.selfMoveTestStatus"      @change="selfMoveTestChange" active-text="Open" inactive-text="Close"      />
    </div>
    <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
      <BaseButton :loading="delLoading" type="danger" @click="delData(null)">
        {{ t('exampleDemo.del') }}
      </BaseButton>
      <BaseButton type="primary" @click="hand('testtopic','testtopicg','c')">测试</BaseButton>
      <BaseButton type="primary" @click="handAll('testtopic','testtopicg','c')">清空命令</BaseButton>
      
    </div>

    <!--<Table
      v-model:pageSize="pageSize"
      v-model:currentPage="currentPage"
      :columns="allSchemas.tableColumns"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total: total
      }"
      @register="tableRegister"
    />-->
    <br/>
    <br/>
    <div  style="position: relative;display: block;transform: rotate(90deg);top:486px;left:1px;z-index: 9999;border: 2px solid #FFD58D;border-radius: 10px;height: 220px;width: 300px;">
      <img id="testimg"  style="width: 100%;height: 100%;display: none;"  src="/public/logo1.png"/>
    </div>
       
    <div id="phoneDiv" style="width:100%;height: 750px; position: relative;display: block;">
      <div  style="width: 300px;height: 700px;background-color: #F9FFE4; margin: 0 auto; top: 50%; transform: translateY(-50%); position: absolute;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);border-radius: 15px;">
        <div style="width: 90%;height: 25%;margin: 0 auto;background-color: #DCFFCC;position: relative;border-top-left-radius: 20px; border-top-right-radius: 20px;">
          <div  style="width: 50px;height: 50px;top:10px;left:115px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"     @touchstart="handpush('testtopic','testtopicg','5','c')"     @touchend="handpush('testtopic','testtopicg','9','c')"><el-icon><Top /></el-icon></div><!-- 左边  -->
          <div  style="width: 50px;height: 50px;top:110px;left:115px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @touchstart="handpush('testtopic','testtopicg','6','c')"        @touchend="handpush('testtopic','testtopicg','9','c')"><el-icon><Bottom /></el-icon></div> <!-- 右边  -->
          <div  style="width: 50px;height: 50px;top:60px;left:50px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"     @touchstart="handpush('testtopic','testtopicg','2','c')"         @touchend="handpush('testtopic','testtopicg','9','c')"><el-icon><Back /></el-icon></div><!-- 下边  -->
          <div  style="width: 50px;height: 50px;top:60px;left:180px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"     @touchstart="handpush('testtopic','testtopicg','1','c')"      @touchend="handpush('testtopic','testtopicg','9','c')"><el-icon><Right /></el-icon></div><!-- 上边  -->
          <div  style="width: 20px;height: 40px;top:120px;left:240px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"     @touchstart="handpush('testtopic','testtopicg','9','c')"      @touchend="handpush('testtopic','testtopicg','9','c')"></div>
          
        </div>
        <div style="width: 90%;height: 50%;margin: 0 auto;background-color: #FFD58D;position: relative;display: flex; justify-content: center; align-items: center;">
          <div style="width: 90%;height: 90%;border: 2px solid #FF7E41;border-radius: 10px;">
            <div style="width: 100%;height: 100%;background-image:url('/public/logo.png');background-size: contain; background-repeat: no-repeat; background-position: center;transform: rotate(90deg); transform-origin: center center;"></div>
          </div>
        </div>
        <div style="width: 90%;height: 25%;margin: 0 auto;background-color: #DCFFCC;position: relative;border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
          <div  style="width: 20px;height: 40px;top:9px;left:240px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"     @touchstart="handpush('testtopic','testtopicg','9','c')"       @touchend="handpush('testtopic','testtopicg','9','c')"  ></div>
            <div  style="width: 50px;height: 50px;top:10px;left:115px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"     @touchstart="handpush('testtopic','testtopicg','7','c')"      @touchend="handpush('testtopic','testtopicg','9','c')" >X</div>
            <div  style="width: 50px;height: 50px;top:110px;left:115px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @touchstart="handpush('testtopic','testtopicg','8','c')"     @touchend="handpush('testtopic','testtopicg','9','c')"  >B</div>
            <div  style="width: 50px;height: 50px;top:60px;left:50px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"      @touchstart="handpush('testtopic','testtopicg','3','c')"     @touchend="handpush('testtopic','testtopicg','9','c')" >A</div>
            <div  style="width: 50px;height: 50px;top:60px;left:180px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"     @touchstart="handpush('testtopic','testtopicg','4','c')"     @touchend="handpush('testtopic','testtopicg','9','c')"  >Y</div>
        </div>
      </div>
    </div>
    <div id="pcDiv" style="width:100%;height: 750px; position: relative;display: none;">
      <div  style="width: 300px;height: 700px;background-color: #F9FFE4; margin: 0 auto; top: 50%; transform: translateY(-50%); position: absolute;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);border-radius: 15px;">
        <div style="width: 90%;height: 25%;margin: 0 auto;background-color: #DCFFCC;position: relative;border-top-left-radius: 20px; border-top-right-radius: 20px;">
          <div  style="width: 50px;height: 50px;top:10px;left:115px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @mousedown="handpush('testtopic','testtopicg','5','c')"    @mouseup="handpush('testtopic','testtopicg','9','c')" ><el-icon><Top /></el-icon></div><!-- 左边  -->
          <div  style="width: 50px;height: 50px;top:110px;left:115px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @mousedown="handpush('testtopic','testtopicg','6','c')"       @mouseup="handpush('testtopic','testtopicg','9','c')"  ><el-icon><Bottom /></el-icon></div> <!-- 右边  -->
          <div  style="width: 50px;height: 50px;top:60px;left:50px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @mousedown="handpush('testtopic','testtopicg','2','c')"    @mouseup="handpush('testtopic','testtopicg','9','c')" ><el-icon><Back /></el-icon></div><!-- 下边  -->
          <div  style="width: 50px;height: 50px;top:60px;left:180px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @mousedown="handpush('testtopic','testtopicg','1','c')"      @mouseup="handpush('testtopic','testtopicg','9','c')"  ><el-icon><Right /></el-icon></div><!-- 上边  -->
          <div  style="width: 20px;height: 40px;top:120px;left:240px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @mousedown="handpush('testtopic','testtopicg','9','c')"         @mouseup="handpush('testtopic','testtopicg','9','c')" ></div>
          
        </div>
         <div style="width: 90%;height: 50%;margin: 0 auto;background-color: #FFD58D;position: relative;display: flex; justify-content: center; align-items: center;">
         
          <div style="width: 90%;height: 90%;border: 2px solid #FF7E41;border-radius: 10px;">
           
            <div id="center_logo" style="width: 100%;height: 100%;background-image:url('/public/logo.png');background-size: contain; background-repeat: no-repeat; background-position: center;transform: rotate(90deg); transform-origin: center center;">
              
            </div>
          </div>
        </div>
        <div style="width: 90%;height: 25%;margin: 0 auto;background-color: #DCFFCC;position: relative;border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
          <div  style="width: 20px;height: 40px;top:9px;left:240px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @mousedown="handpush('testtopic','testtopicg','9','c')"       @mouseup="handpush('testtopic','testtopicg','9','c')"  ></div>
            <div  style="width: 50px;height: 50px;top:10px;left:115px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @mousedown="handpush('testtopic','testtopicg','7','c')"     @mouseup="handpush('testtopic','testtopicg','9','c')"  >X</div>
            <div  style="width: 50px;height: 50px;top:110px;left:115px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @mousedown="handpush('testtopic','testtopicg','8','c')"     @mouseup="handpush('testtopic','testtopicg','9','c')"   >B</div>
            <div  style="width: 50px;height: 50px;top:60px;left:50px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @mousedown="handpush('testtopic','testtopicg','3','c')"     @mouseup="handpush('testtopic','testtopicg','9','c')"  >A</div>
            <div  style="width: 50px;height: 50px;top:60px;left:180px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @mousedown="handpush('testtopic','testtopicg','4','c')"    @mouseup="handpush('testtopic','testtopicg','9','c')"   >Y</div>
        </div>
      </div>
    </div>

  </ContentWrap>

  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <Write
      v-if="actionType !== 'detail'"
      ref="writeRef"
      :form-schema="allSchemas.formSchema"
      :current-row="currentRow"
    />

    <Detail
      v-if="actionType === 'detail'"
      :detail-schema="allSchemas.detailSchema"
      :current-row="currentRow"
    />

    <template #footer>
      <BaseButton
        v-if="actionType !== 'detail'"
        type="primary"
        :loading="saveLoading"
        @click="save"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
