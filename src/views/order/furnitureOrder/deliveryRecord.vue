<template>
  <div class="app-container">

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['order:deliveryRecord:add']"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="deliveryRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="expand">
        <template #default="props">
          <div m="4">
            <p m="t-0 b-2">配送编号: {{ props.row.id }}</p>
            <p m="t-0 b-2">订单编号: {{ props.row.orderId }}</p>
            <p m="t-0 b-2">创建者: {{ props.row.createBy }}</p>
            <p m="t-0 b-2">创建时间: {{ parseTime(props.row.createTime) }}</p>
            <p m="t-0 b-2">更新者: {{ props.row.updateBy }}</p>
            <p m="t-0 b-2">更新时间: {{ parseTime(props.row.updateTime) }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="配送员" align="center" prop="workerId" >
        <template #default="scope">
          <span>{{ userStore.getUserNameById(scope.row.workerId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配送时间" align="center" prop="deliveryTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deliveryTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配送状态" align="center" prop="deliveryStatus">
        <template #default="scope">
          <dict-tag :options="record_delivery_status" :value="scope.row.deliveryStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:deliveryRecord:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:deliveryRecord:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 添加或修改配送记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="deliveryRecordRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="配送员" prop="workerId">
          <el-select v-model="form.workerId" placeholder="请选择配送员">
            <el-option
              v-for="item in deliveryWorkers"
              :key="item.userId"
              :label="item.userName"
              :value="item.userId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="配送时间" prop="deliveryTime">
          <el-date-picker clearable
            v-model="form.deliveryTime"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择配送时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="配送状态" prop="deliveryStatus">
          <el-radio-group v-model="form.deliveryStatus">
            <el-radio
              v-for="dict in record_delivery_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="DeliveryRecord">
import { listDeliveryRecord, getDeliveryRecord, delDeliveryRecord, addDeliveryRecord, updateDeliveryRecord } from "@/api/order/deliveryRecord";
import useUserStore from '@/store/modules/user'
import { parseTime } from "@/utils/ruoyi";
import { ref, toRaw  } from "vue";
import { eventBus } from "@/utils/eventBus";
const userStore = useUserStore()

// 接收 props
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

watch(() => props.order, () => {
  getList();
});

const { proxy } = getCurrentInstance();
const { record_delivery_status } = proxy.useDict('record_delivery_status');

const deliveryRecordList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const deliveryWorkers = userStore.userList.filter(item => item.postId == 5);
deliveryWorkers.forEach(item => {
  console.log("配送员 ", item.userName);
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 1000,
    orderId: null,
  },
  rules: {
    orderId: [
      { required: true, message: "订单号不能为空", trigger: "blur" }
    ],
    deliveryTime: [
      { required: true, message: "配送时间不能为空", trigger: "blur" }
    ],
    deliveryStatus: [
      { required: true, message: "配送状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询配送记录列表 */
function getList() {
  loading.value = true;
  queryParams.value.orderId = props.order.id;
  listDeliveryRecord(queryParams.value).then(response => {
    deliveryRecordList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    orderId: null,
    deliveryTime: parseTime(new Date()),
    deliveryStatus: null,
    remark: null
  };
  proxy.resetForm("deliveryRecordRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加配送记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getDeliveryRecord(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改配送记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deliveryRecordRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateDeliveryRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          eventBus.emit("orderUpdated");
          getList();
        });
      } else {
        form.value.orderId = props.order.id;
        addDeliveryRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          eventBus.emit("orderUpdated");
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除配送记录编号为"' + _ids + '"的数据项？').then(function() {
    return delDeliveryRecord(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
    eventBus.emit("orderUpdated");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/deliveryRecord/export', {
    ...queryParams.value
  }, `deliveryRecord_${new Date().getTime()}.xlsx`)
}


getList();
</script>
