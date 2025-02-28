<template>
  <div class="component-upload-image">
    <el-upload
      multiple
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      ref="imageUpload"
      :before-remove="beforeDel"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{ hide: fileList.length >= limit }"
      :data="associationData"
    >
      <el-icon class="avatar-uploader-icon"><plus /></el-icon>
    </el-upload>
    <!-- 上传提示 -->
    <div class="el-upload__tip" v-if="showTip">
      请上传
      <template v-if="fileSize">
        大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
      </template>
      的文件
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="预览"
      width="800px"
      append-to-body
    >
      <img
        :src="dialogImageUrl"
        style="display: block; max-width: 100%; margin: 0 auto"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { getToken } from "@/utils/auth";
import request from '@/utils/request';
import Compressor from 'compressorjs';

const props = defineProps({
  modelValue: [String, Object, Array],
  // 图片数量限制
  limit: {
    type: Number,
    default: 5,
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 10,
  },
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: {
    type: Array,
    default: () => ["png", "jpg", "jpeg"],
  },
  // 是否显示提示
  isShowTip: {
    type: Boolean,
    default: true
  },
  //关联数据
  associationData: {
    type: Object,
    default: {
      associationId: "",
      associationType: ""
    }
  }
});

const { proxy } = getCurrentInstance();
const emit = defineEmits();
const number = ref(0);
const uploadList = ref([]);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadImgUrl = ref(import.meta.env.VITE_APP_BASE_API + "/common/upload"); // 上传的图片服务器地址
const headers = ref({ Authorization: "Bearer " + getToken() });
const fileList = ref([]);
const showTip = computed(
  () => props.isShowTip && (props.fileType || props.fileSize)
);

watch(() => props.modelValue, val => {
  if (val) {
    // 首先将值转为数组
    const list = Array.isArray(val) ? val : props.modelValue.split(",");
    // 然后将数组转为对象数组
    fileList.value = list.map(item => {
      if (typeof item === "string") {
        if (item.indexOf(baseUrl) === -1) {
          item = { name: baseUrl + item, url: baseUrl + item };
        } else {
          item = { name: item, url: item };
        }
      }
      return item;
    });
  } else {
    fileList.value = [];
    return [];
  }
},{ deep: true, immediate: true });


// 上传前loading加载
function handleBeforeUpload(file) {
  let isImg = false;
  if (props.fileType.length) {
    let fileExtension = "";
    if (file.name.lastIndexOf(".") > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
    }
    isImg = props.fileType.some(type => {
      if (file.type.indexOf(type) > -1) return true;
      if (fileExtension && fileExtension.indexOf(type) > -1) return true;
      return false;
    });
  } else {
    isImg = file.type.indexOf("image") > -1;
  }
  if (!isImg) {
    proxy.$modal.msgError(
      `文件格式不正确, 请上传${props.fileType.join("/")}图片格式文件!`
    );
    return false;
  }
  console.log("开始校验图片大小。。")
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy.$modal.alert(`上传图片大小不能超过 ${props.fileSize} MB!`);
      return false;
    }
  }

  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6, // 压缩质量
      success: (result) => { // 使用箭头函数
        // 显示压缩后的图片
        console.log('成功压缩图片:', file.size / 1024 / 1024, result.size / 1024 / 1024);
        resolve(result); // 解析压缩后的文件
      },
      error: (err) => { // 同样使用箭头函数
        console.error('压缩失败:', err.message);
        reject(err); // 拒绝并返回错误
      }
    });
  }).then((compressedFile) => {
    proxy.$modal.loading("正在上传图片，请稍候...");
    number.value++;
    return compressedFile; // 返回压缩后的文件以便继续上传
  }).catch((err) => {
    proxy.$modal.closeLoading();
    proxy.$modal.msgError("图片压缩失败，请重试！");
    return Promise.reject(err); // 返回错误
  });
}

// 文件个数超出
function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`);
}

// 上传成功回调
function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    var id = res.newFileName.split('.')[0];
    uploadList.value.push({ name: res.fileName, url: baseUrl + res.fileName, id: id });
    uploadedSuccessfully();
  } else {
    number.value--;
    proxy.$modal.closeLoading();
    proxy.$modal.msgError(res.msg);
    proxy.$refs.imageUpload.handleRemove(file);
    uploadedSuccessfully();
  }
}

function beforeDel(file) {
  console.log("beforeDel:"+ file.name);
  console.log(file.name.startsWith(baseUrl))
  // 说明：这个方法会有2中情况被调用：
  // 1.手动删除时调用，也就是手动删除已经上传成功的图片，已经上传成功的图片，都是服务器返回的图片。
  //     服务器返回的图片的name都是以baseUrl开头的。所以如果是删除服务器图片，就要先弹窗确认。
  //     防止误删。
  // 2.自动调用。什么时候会自动调用这个方法呢？就是当上传文件不符合要求时会调用，比如文件过大。或者文件格式不对。或者
  //     文件数量超出限制。这些都会自动调用这个方法。这个时候，就要直接删除，也就是直接返回true就行。不应该弹窗确认是否
  //     删除。
  if (file.name.startsWith(baseUrl)) {
    proxy.$modal.confirm('确认删除图片？').then(function() {
      return handleDelete(file);
    })
  } else {
    return true;
  }
  
}

// 删除图片
async function  handleDelete(file) {
  console.log("handleDelete:"+ file.name);
  console.log("fileList:", fileList);
  console.log("number:", uploadList.value.length, number.value)
  const findex = fileList.value.map(f => f.name).indexOf(file.name);
  if (findex > -1 && uploadList.value.length === number.value) {
    console.log("handleDelete2:"+ file.name);
    //删除请求
    
  }

  var deleteFilePath = [];
    const filePath = file.name.indexOf(baseUrl) > -1 ? file.name.substring(baseUrl.length) : file.name;
    deleteFilePath.push(filePath);
    const response = await request({
      url: '/common/deleteFiles',
      method: 'post',
      data: deleteFilePath
    });
    
    // fileList.value.splice(findex, 1);
    emit("update:modelValue", uploadList.value);
    return true;
}

// 上传结束处理
function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    
  }

  fileList.value = fileList.value.filter(f => f.url !== undefined).concat(uploadList.value);
    uploadList.value = [];
    number.value = 0;
    emit("update:modelValue", uploadList.value);
    proxy.$modal.closeLoading();
}

// 上传失败
function handleUploadError() {
  proxy.$modal.msgError("上传图片失败");
  proxy.$modal.closeLoading();
}

// 预览
function handlePictureCardPreview(file) {
  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
}

// 对象转成指定字符串分隔
function listToString(list, separator) {
  let strs = "";
  separator = separator || ",";
  for (let i in list) {
    if (undefined !== list[i].url && list[i].url.indexOf("blob:") !== 0) {
      strs += list[i].url.replace(baseUrl, "") + separator;
    }
  }
  return strs != "" ? strs.substr(0, strs.length - 1) : "";
}
</script>

<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
:deep(.hide .el-upload--picture-card) {
    display: none;
}
</style>
