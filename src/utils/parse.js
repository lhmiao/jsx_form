
import React from 'react'
import {
    vmodelParse,
    vforParse,
    vshowParse,
    vlabelParse,
    vvalidateParse,
} from './index'

// 指令解析顺序
const sortDirective = ['v-for', 'v-label', 'v-model', 'v-validate']

const parseDirect = (key, element, options, loopDealFn) => {
    switch(key){
        case 'v-model':
            vmodelParse(element, options)
            break
        case 'v-for':
            vforParse(element, options, loopDealFn)
            break
        case 'v-show':
            vshowParse(element, options)
            break
        case 'v-label':
            vlabelParse(element)
            break
        case 'v-validate':
            vvalidateParse(element, options)
            break
    }
}

const loopDeal = (children, options, parent) => {
    // 如果不为React组件，不处理
    if(!children || !(children instanceof Object)){
        return
    }
    if(Array.isArray(children)){
        // 从后往前开始解析，避免v-for复制的元素
        const len = children.length
        for(let i = len - 1; i >= 0; i--){
            loopDeal(children[i], options, parent)
        }
    }else if(children.$$typeof && children.$$typeof.toString() === 'Symbol(react.element)'){
        const props = children.props
        children.__parent__ = parent || null
        let keys = Object.keys(props)
        // 对指令排序，确保v-for指令先执行
        if(keys.includes('v-for')){
            keys = [...new Set([...sortDirective, ...keys])]
        }
        keys.forEach(key => {
            // 如果prop是指令
            if(key.indexOf('v-') === 0){
                parseDirect(key, children, options, loopDeal)
            }
        })
        //  如果存在子元素
        const childElement = children.props.children
        if(childElement && childElement instanceof Object){
            loopDeal(childElement, options, children)
        }
    }
}

export default (parent, options) => {
    const children = parent.props.children
    loopDeal(children, options, parent)
    return parent.props.children
}