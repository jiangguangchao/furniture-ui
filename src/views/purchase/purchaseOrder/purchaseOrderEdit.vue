<template>
  <div class="app-container">
    <el-form ref="purchaseOrderRef" :model="form" :rules="rules" label-width="80px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="供货方" prop="supplier">
            <el-input v-model="form.supplier" placeholder="请输入供货方" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订货时间" prop="purchaseDate">
            <el-date-picker clearable v-model="form.purchaseDate" type="datetime" format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择订货时间">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="到货状态" prop="arrivalStatus">
            <el-select v-model="form.arrivalStatus">
              <el-option v-for="dict in purchase_arrival_status" :key="dict.value" :label="dict.label"
                :value="dict.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="微信" prop="weichat">
            <el-input v-model="form.weichat" placeholder="请输入微信" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="总金额" prop="totalAmount">
            <el-input v-model="form.totalAmount" placeholder="请输入总金额" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="物流" prop="logistics">
            <el-select v-model="form.logistics" clearable @change="logisticsChange">
              <el-option v-for="dict in purchase_logistics" :key="dict.value" :label="dict.label"
                :value="dict.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物流费" prop="logisticsMoney">
            <el-input-number v-model="form.logisticsMoney" :min="0" placeholder="请输入物流费" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注" prop="remarks">
        <el-input v-model="form.remarks" type="textarea" placeholder="请输入内容" />
      </el-form-item>

      <el-form-item>
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <!-- <el-button @click="cancel">取 消</el-button> -->
            </el-form-item>

    </el-form>
  </div>
</template>

<script setup>
import { eventBus } from "@/utils/eventBus";
import { listPurchaseOrder, getPurchaseOrder, delPurchaseOrder, addPurchaseOrder, updatePurchaseOrder } from "@/api/purchase/purchaseOrder";
const { proxy } = getCurrentInstance();
const { purchase_arrival_status } = proxy.useDict('purchase_arrival_status');
const { purchase_logistics } = proxy.useDict('purchase_logistics');

// 接收 props
const props = defineProps({
  purchaseOrder: {
    type: Object,
    required: false,
  },
});

const associationType = 'PO';


const data = reactive({
  //判断props.purchaseOrder是否为空，然后赋值form
  form: { ...props.purchaseOrder },

  // form: {...props.purchaseOrder},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    purchaseDate: null,
    arrivalStatus: null,
  },
  rules: {
    supplier: [
      { required: true, message: "供货方不能为空", trigger: "blur" }
    ],
    purchaseDate: [
      { required: true, message: "日期不能为空", trigger: "blur" }
    ],
    arrivalStatus: [
      { required: true, message: "到货状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);


if (!props.purchaseOrder) {
  // 重置表单
  console.log("重置表单")
  reset();
}

console.log("form:", form.value)

// 表单重置
function reset() {
  form.value = {
    id: null,
    supplier: null,
    purchaseDate: null,
    arrivalStatus: '0',
    phone: null,
    weichat: null,
    orderList: null,
    totalAmount: null,
    goodsList: null,
    remarks: null,
    uploadFiles: [],
    logistics: null, 
    logisticsMoney: null

  };
  proxy.resetForm("purchaseOrderRef");
  // associationData.value.associationId = '';
  // associationData.value.associationType = associationType;
}


/** 提交按钮 */
function submitForm() {
  proxy.$refs["purchaseOrderRef"].validate(valid => {
    if (valid) {

      form.value.goodsList = null;//防止goodsList被修改，因为当前页面不对goodsList做修改

      if (form.value.id != null) {
        //修改提交时不需要传uploadFiles，因为文件上传时已经绑定到了当前记录。
        //如果这里不清空，会导致当前记录关联的文件上传记录重复
        form.value.uploadFiles = [];
        updatePurchaseOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          eventBus.emit(associationType + ":orderupdated");
        });
      } else {
        addPurchaseOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          eventBus.emit(associationType + ":orderupdated");
        });
      }
    }
  });
}

function logisticsChange(value) {
  if (value == '-1') {
    form.value.logisticsMoney = 0;
  }
}

// function getDefaultTime() {
//   return parseTime(new Date())
// }




</script>