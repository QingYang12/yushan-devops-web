<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { ElTag } from 'element-plus'
import { Table } from '@/components/Table'
import { getTableListApi, saveTableApi, delTableListApi } from '@/api/table'
import { useTable } from '@/hooks/web/useTable'
import { TableData } from '@/api/table/types'
import { ref, unref, reactive } from 'vue'
import Write from './components/Write.vue'
import Detail from './components/Detail.vue'
import { CrudSchema, useCrudSchemas } from '@/hooks/web/useCrudSchemas'
import { BaseButton } from '@/components/Button'
import { handpushApi ,handApi} from '@/api/embedded'
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

const searchParams = ref({})
const setSearchParams = (params: any) => {
  searchParams.value = params
  getList()
}

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
const handpush = async (topic: string, group: string,message: string) => {
  let params = {
    topic: topic,
    group: group,
    message: message
  }
  await handpushApi(params);
}
const hand = async (topic: string, group: string) => {
  let params = {
    topic: topic,
    group: group
  }
  let res:any=await handApi(params);
  console.log("res: ",res);
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
</script>

<template>
  <ContentWrap>
    <Search :schema="allSchemas.searchSchema" @search="setSearchParams" @reset="setSearchParams" />

    <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
      <BaseButton :loading="delLoading" type="danger" @click="delData(null)">
        {{ t('exampleDemo.del') }}
      </BaseButton>
      <BaseButton type="primary" @click="hand('testtopic','testtopicg')">测试</BaseButton>
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
    <div  style="width:100%;height: 750px; position: relative;">
      <div  style="width: 300px;height: 700px;background-color: #F9FFE4; margin: 0 auto; top: 50%; transform: translateY(-50%); position: absolute;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);border-radius: 15px;">
        <div style="width: 90%;height: 25%;margin: 0 auto;background-color: #DCFFCC;position: relative;border-top-left-radius: 20px; border-top-right-radius: 20px;">
          <div  style="width: 50px;height: 50px;top:10px;left:115px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @click="handpush('testtopic','testtopicg','5')"    ><el-icon><Top /></el-icon></div><!-- 左边  -->
          <div  style="width: 50px;height: 50px;top:110px;left:115px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @click="handpush('testtopic','testtopicg','6')"    ><el-icon><Bottom /></el-icon></div> <!-- 右边  -->
          <div  style="width: 50px;height: 50px;top:60px;left:50px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @click="handpush('testtopic','testtopicg','2')"    ><el-icon><Back /></el-icon></div><!-- 下边  -->
          <div  style="width: 50px;height: 50px;top:60px;left:180px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @click="handpush('testtopic','testtopicg','1')"    ><el-icon><Right /></el-icon></div><!-- 上边  -->
          <div  style="width: 20px;height: 40px;top:120px;left:240px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @click="handpush('testtopic','testtopicg','9')"    ></div>
          
        </div>
        <div style="width: 90%;height: 50%;margin: 0 auto;background-color: #FFD58D;position: relative;display: flex; justify-content: center; align-items: center;">
          <div style="width: 90%;height: 90%;border: 2px solid #FF7E41;border-radius: 10px;">
            <div style="width: 100%;height: 100%;background-image:url('/public/logo.png');background-size: contain; background-repeat: no-repeat; background-position: center;transform: rotate(90deg); transform-origin: center center;"></div>
          </div>
        </div>
        <div style="width: 90%;height: 25%;margin: 0 auto;background-color: #DCFFCC;position: relative;border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
          <div  style="width: 20px;height: 40px;top:9px;left:240px;background-color: #FF8537;position: absolute;  align-items: center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @click="handpush('testtopic','testtopicg','9')"    ></div>
            <div  style="width: 50px;height: 50px;top:10px;left:115px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @click="handpush('testtopic','testtopicg','7')"    >X</div>
            <div  style="width: 50px;height: 50px;top:110px;left:115px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @click="handpush('testtopic','testtopicg','8')"    >B</div>
            <div  style="width: 50px;height: 50px;top:60px;left:50px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @click="handpush('testtopic','testtopicg','4')"    >A</div>
            <div  style="width: 50px;height: 50px;top:60px;left:180px;background-color: #FF8537;position: absolute;  display: flex; justify-content: center; align-items: center;font-size:30px;transform: rotate(90deg); transform-origin: center center;border-radius: 20px;box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);"    @click="handpush('testtopic','testtopicg','3')"    >Y</div>
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
