<template>
<md-layout md-gutter>
    <callee></callee>
    <caller> </caller>
</md-layout>
</template>

<script>
import Caller from "./caller.vue"
import Callee from "./callee.vue"

export default {
    components: {
        'caller': Caller,
        'callee': Callee
    },
}
</script>

<style lang="sass">
</style>
