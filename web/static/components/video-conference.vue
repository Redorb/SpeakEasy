<template>
<md-layout md-gutter>
    <md-layout md-flex="25" md-flex-offset="25" md-gutter>
        <callee></callee>
    </md-layout>
    <md-layout md-flex="25">
        <caller> </caller>
    </md-layout>
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
