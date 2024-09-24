<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['order:paymentRecord:add']"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="paymentRecordList" @selection-change="handleSelectionChange" border>
      <el-table-column type="expand">
        <template #default="props">
          <div m="4">
            <p m="t-0 b-2">支付记录编号: {{ props.row.id }}</p>
            <p m="t-0 b-2">订单编号: {{ props.row.orderId }}</p>
            <p m="t-0 b-2">创建者: {{ props.row.createBy }}</p>
            <p m="t-0 b-2">创建时间: {{ parseTime(props.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</p>
            <p m="t-0 b-2">更新者: {{ props.row.updateBy }}</p>
            <p m="t-0 b-2">更新时间: {{ parseTime(props.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="支付时间" align="center" prop="paymentTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.paymentTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付金额" align="center" prop="paymentAmount" />
      <el-table-column label="支付方式" align="center" prop="paymentMethod">
        <template #default="scope">
          <dict-tag :options="payment_method" :value="scope.row.paymentMethod" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['order:paymentRecord:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['order:paymentRecord:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 添加或修改支付记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="paymentRecordRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="支付时间" prop="paymentTime">
          <el-date-picker clearable
            v-model="form.paymentTime"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择支付时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="支付金额" prop="paymentAmount">
          <el-input v-model="form.paymentAmount" placeholder="请输入支付金额" />
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="form.paymentMethod" placeholder="请选择支付方式">
            <el-option v-for="dict in payment_method" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
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

<script setup name="PaymentRecord">
import { listPaymentRecord, getPaymentRecord, delPaymentRecord, addPaymentRecord, updatePaymentRecord } from "@/api/order/paymentRecord";
import { parseTime } from "@/utils/ruoyi";


// 接收 props
const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const { proxy } = getCurrentInstance();
const { payment_method } = proxy.useDict("payment_method");

const paymentRecordList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 1000,
    orderId: null,
  },
  rules: {
    orderId: [
      { required: true, message: "订单编号不能为空", trigger: "blur" }
    ],
    paymentTime: [
      { required: true, message: "支付时间不能为空", trigger: "blur" }
    ],
    paymentAmount: [
      { required: true, message: "支付金额不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询支付记录列表 */
function getList() {
  loading.value = true;
  queryParams.value.orderId = props.order.id;
  listPaymentRecord(queryParams.value).then(response => {
    paymentRecordList.value = response.rows;
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
    paymentTime:  parseTime(new Date()),
    paymentMethod: null,
    paymentAmount: null,
    remark: null
  };
  proxy.resetForm("paymentRecordRef");
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
  title.value = "添加支付记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPaymentRecord(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改支付记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["paymentRecordRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePaymentRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        form.value.orderId = props.order.id;
        addPaymentRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除支付记录编号为"' + _ids + '"的数据项？').then(function() {
    return delPaymentRecord(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/paymentRecord/export', {
    ...queryParams.value
  }, `paymentRecord_${new Date().getTime()}.xlsx`)
}

getList();
</script>
