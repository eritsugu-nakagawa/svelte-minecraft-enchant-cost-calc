
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\CardComponent.svelte generated by Svelte v3.46.4 */

    const file$3 = "src\\CardComponent.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (27:8) {#each card.name as name}
    function create_each_block$2(ctx) {
    	let dt;
    	let t_value = /*name*/ ctx[9] + "";
    	let t;

    	const block = {
    		c: function create() {
    			dt = element("dt");
    			t = text(t_value);
    			add_location(dt, file$3, 27, 10, 583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, dt, anchor);
    			append_dev(dt, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*card*/ 1 && t_value !== (t_value = /*name*/ ctx[9] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(dt);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(27:8) {#each card.name as name}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let dl;
    	let div1_data_result_cost_value;
    	let each_value = /*card*/ ctx[0].name;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			dl = element("dl");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(dl, "class", "svelte-1waikzj");
    			add_location(dl, file$3, 24, 6, 502);
    			attr_dev(div0, "class", "card svelte-1waikzj");
    			add_location(div0, file$3, 23, 4, 476);
    			attr_dev(div1, "class", "card-div svelte-1waikzj");
    			attr_dev(div1, "data-result-cost", div1_data_result_cost_value = /*card*/ ctx[0].resultCost);
    			add_location(div1, file$3, 22, 2, 413);
    			attr_dev(div2, "class", "card-wrap svelte-1waikzj");
    			toggle_class(div2, "rowFirst", /*rowFirst*/ ctx[1]);
    			toggle_class(div2, "rowLast", /*rowLast*/ ctx[2]);
    			toggle_class(div2, "columnFirst", /*columnFirst*/ ctx[3]);
    			toggle_class(div2, "columnLast", /*columnLast*/ ctx[4]);
    			toggle_class(div2, "columnEven", /*columnEven*/ ctx[6]);
    			toggle_class(div2, "rowEven", /*rowEven*/ ctx[5]);
    			add_location(div2, file$3, 13, 0, 268);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, dl);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(dl, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*card*/ 1) {
    				each_value = /*card*/ ctx[0].name;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(dl, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*card*/ 1 && div1_data_result_cost_value !== (div1_data_result_cost_value = /*card*/ ctx[0].resultCost)) {
    				attr_dev(div1, "data-result-cost", div1_data_result_cost_value);
    			}

    			if (dirty & /*rowFirst*/ 2) {
    				toggle_class(div2, "rowFirst", /*rowFirst*/ ctx[1]);
    			}

    			if (dirty & /*rowLast*/ 4) {
    				toggle_class(div2, "rowLast", /*rowLast*/ ctx[2]);
    			}

    			if (dirty & /*columnFirst*/ 8) {
    				toggle_class(div2, "columnFirst", /*columnFirst*/ ctx[3]);
    			}

    			if (dirty & /*columnLast*/ 16) {
    				toggle_class(div2, "columnLast", /*columnLast*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CardComponent', slots, []);
    	let { card } = $$props;
    	let { rowFirst } = $$props;
    	let { rowLast } = $$props;
    	let { columnFirst } = $$props;
    	let { columnLast } = $$props;
    	let { rowIdx } = $$props;
    	let { columnIdx } = $$props;
    	let rowEven = rowIdx % 2 === 0;
    	let columnEven = columnIdx % 2 === 0;

    	const writable_props = [
    		'card',
    		'rowFirst',
    		'rowLast',
    		'columnFirst',
    		'columnLast',
    		'rowIdx',
    		'columnIdx'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CardComponent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('card' in $$props) $$invalidate(0, card = $$props.card);
    		if ('rowFirst' in $$props) $$invalidate(1, rowFirst = $$props.rowFirst);
    		if ('rowLast' in $$props) $$invalidate(2, rowLast = $$props.rowLast);
    		if ('columnFirst' in $$props) $$invalidate(3, columnFirst = $$props.columnFirst);
    		if ('columnLast' in $$props) $$invalidate(4, columnLast = $$props.columnLast);
    		if ('rowIdx' in $$props) $$invalidate(7, rowIdx = $$props.rowIdx);
    		if ('columnIdx' in $$props) $$invalidate(8, columnIdx = $$props.columnIdx);
    	};

    	$$self.$capture_state = () => ({
    		card,
    		rowFirst,
    		rowLast,
    		columnFirst,
    		columnLast,
    		rowIdx,
    		columnIdx,
    		rowEven,
    		columnEven
    	});

    	$$self.$inject_state = $$props => {
    		if ('card' in $$props) $$invalidate(0, card = $$props.card);
    		if ('rowFirst' in $$props) $$invalidate(1, rowFirst = $$props.rowFirst);
    		if ('rowLast' in $$props) $$invalidate(2, rowLast = $$props.rowLast);
    		if ('columnFirst' in $$props) $$invalidate(3, columnFirst = $$props.columnFirst);
    		if ('columnLast' in $$props) $$invalidate(4, columnLast = $$props.columnLast);
    		if ('rowIdx' in $$props) $$invalidate(7, rowIdx = $$props.rowIdx);
    		if ('columnIdx' in $$props) $$invalidate(8, columnIdx = $$props.columnIdx);
    		if ('rowEven' in $$props) $$invalidate(5, rowEven = $$props.rowEven);
    		if ('columnEven' in $$props) $$invalidate(6, columnEven = $$props.columnEven);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		card,
    		rowFirst,
    		rowLast,
    		columnFirst,
    		columnLast,
    		rowEven,
    		columnEven,
    		rowIdx,
    		columnIdx
    	];
    }

    class CardComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			card: 0,
    			rowFirst: 1,
    			rowLast: 2,
    			columnFirst: 3,
    			columnLast: 4,
    			rowIdx: 7,
    			columnIdx: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardComponent",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*card*/ ctx[0] === undefined && !('card' in props)) {
    			console.warn("<CardComponent> was created without expected prop 'card'");
    		}

    		if (/*rowFirst*/ ctx[1] === undefined && !('rowFirst' in props)) {
    			console.warn("<CardComponent> was created without expected prop 'rowFirst'");
    		}

    		if (/*rowLast*/ ctx[2] === undefined && !('rowLast' in props)) {
    			console.warn("<CardComponent> was created without expected prop 'rowLast'");
    		}

    		if (/*columnFirst*/ ctx[3] === undefined && !('columnFirst' in props)) {
    			console.warn("<CardComponent> was created without expected prop 'columnFirst'");
    		}

    		if (/*columnLast*/ ctx[4] === undefined && !('columnLast' in props)) {
    			console.warn("<CardComponent> was created without expected prop 'columnLast'");
    		}

    		if (/*rowIdx*/ ctx[7] === undefined && !('rowIdx' in props)) {
    			console.warn("<CardComponent> was created without expected prop 'rowIdx'");
    		}

    		if (/*columnIdx*/ ctx[8] === undefined && !('columnIdx' in props)) {
    			console.warn("<CardComponent> was created without expected prop 'columnIdx'");
    		}
    	}

    	get card() {
    		throw new Error("<CardComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set card(value) {
    		throw new Error("<CardComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rowFirst() {
    		throw new Error("<CardComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rowFirst(value) {
    		throw new Error("<CardComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rowLast() {
    		throw new Error("<CardComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rowLast(value) {
    		throw new Error("<CardComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get columnFirst() {
    		throw new Error("<CardComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set columnFirst(value) {
    		throw new Error("<CardComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get columnLast() {
    		throw new Error("<CardComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set columnLast(value) {
    		throw new Error("<CardComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rowIdx() {
    		throw new Error("<CardComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rowIdx(value) {
    		throw new Error("<CardComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get columnIdx() {
    		throw new Error("<CardComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set columnIdx(value) {
    		throw new Error("<CardComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\CardListComponent.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1 } = globals;
    const file$2 = "src\\CardListComponent.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (126:8) {#each row as card, columnIdx}
    function create_each_block_1(ctx) {
    	let cardcomponent;
    	let current;

    	cardcomponent = new CardComponent({
    			props: {
    				card: /*card*/ ctx[8],
    				rowFirst: /*rowIdx*/ ctx[7] === 0,
    				rowLast: /*rowIdx*/ ctx[7] === /*tmpList*/ ctx[1].length - 1,
    				columnFirst: /*columnIdx*/ ctx[10] === 0,
    				columnLast: /*columnIdx*/ ctx[10] === /*row*/ ctx[5].length - 1,
    				rowIdx: /*rowIdx*/ ctx[7],
    				columnIdx: /*columnIdx*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cardcomponent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cardcomponent, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cardcomponent_changes = {};
    			if (dirty & /*tmpList*/ 2) cardcomponent_changes.card = /*card*/ ctx[8];
    			if (dirty & /*tmpList*/ 2) cardcomponent_changes.rowLast = /*rowIdx*/ ctx[7] === /*tmpList*/ ctx[1].length - 1;
    			if (dirty & /*tmpList*/ 2) cardcomponent_changes.columnLast = /*columnIdx*/ ctx[10] === /*row*/ ctx[5].length - 1;
    			cardcomponent.$set(cardcomponent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardcomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardcomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cardcomponent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(126:8) {#each row as card, columnIdx}",
    		ctx
    	});

    	return block;
    }

    // (122:2) {#each tmpList as row, rowIdx}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*rowIdx*/ ctx[7] + 1 + "";
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let current;
    	let each_value_1 = /*row*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = text("回目");
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			add_location(div0, file$2, 123, 6, 3526);
    			attr_dev(div1, "class", "flex svelte-u3t7gc");
    			add_location(div1, file$2, 124, 6, 3559);
    			attr_dev(div2, "class", "notification svelte-u3t7gc");
    			add_location(div2, file$2, 122, 4, 3492);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t3);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tmpList*/ 2) {
    				each_value_1 = /*row*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(122:2) {#each tmpList as row, rowIdx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	let each_value = /*tmpList*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("総コスト：");
    			t1 = text(/*totalCreateCost*/ ctx[0]);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "notification is-success cost-display svelte-u3t7gc");
    			add_location(div0, file$2, 118, 2, 3364);
    			attr_dev(div1, "class", "block result svelte-u3t7gc");
    			add_location(div1, file$2, 117, 0, 3334);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*totalCreateCost*/ 1) set_data_dev(t1, /*totalCreateCost*/ ctx[0]);

    			if (dirty & /*tmpList*/ 2) {
    				each_value = /*tmpList*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function junretsu(balls, nukitorisu) {
    	var arrs, i, j, zensu, results, parts;
    	arrs = [];
    	zensu = balls.length;

    	if (zensu < nukitorisu) {
    		return;
    	} else if (nukitorisu == 1) {
    		for (i = 0; i < zensu; i++) {
    			arrs[i] = [balls[i]];
    		}
    	} else {
    		for (i = 0; i < zensu; i++) {
    			parts = balls.slice(0);
    			parts.splice(i, 1)[0];
    			results = junretsu(parts, nukitorisu - 1);

    			for (j = 0; j < results.length; j++) {
    				arrs.push([balls[i]].concat(results[j]));
    			}
    		}
    	}

    	return arrs;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let tmpList;
    	let totalCreateCost;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CardListComponent', slots, []);
    	let { items } = $$props;

    	function searchMinCost(items) {
    		let minCost = 1000;
    		let minObj;
    		let patternList = junretsu(items, items.length);

    		patternList.forEach(ptn => {
    			let tmpPtn = ptn.map((elm, i) => {
    				elm.columnStart = i + 2;
    				elm.columnEnd = i + 3;
    				return elm;
    			});

    			let [tmpList, createCost, canCreate] = spreadItems(tmpPtn);

    			if (createCost < minCost && canCreate) {
    				minCost = createCost;
    				minObj = tmpList;
    			}
    		});

    		minObj.pop();
    		return [minObj, minCost];
    	}

    	function spreadItems(items) {
    		let tmpList = [];

    		let resultList = [
    			[
    				...items.map(item => {
    					return { ...item };
    				})
    			]
    		];

    		let countCost = [0, 1, 3];
    		let createCountIdx = 0;
    		let maxCountIdx;
    		let createCost = 0;
    		let totalCreateCost = 0;
    		let idx = 0;
    		let sumCost;
    		let basicCost;
    		let canCreate = true;
    		const MAX_CAN_CREATE_COST = 40;
    		maxCountIdx = Math.ceil(Math.log(resultList[0].length) / Math.log(2)) + 1;

    		for (createCountIdx = 1; createCountIdx < maxCountIdx; createCountIdx++) {
    			resultList.push([]);
    			tmpList = [...resultList[createCountIdx - 1]];

    			if (tmpList.length > 1) {
    				for (idx = 0; idx < tmpList.length - 1; idx += 2) {
    					sumCost = tmpList[idx].cost + tmpList[idx + 1].cost;
    					basicCost = tmpList[idx + 1].cost;
    					createCost = basicCost + countCost[tmpList[idx].createCount] + countCost[tmpList[idx + 1].createCount];

    					resultList[createCountIdx].push({
    						id: [...tmpList[idx].id, tmpList[idx + 1].id],
    						name: [...tmpList[idx].name, ...tmpList[idx + 1].name],
    						cost: sumCost,
    						createCount: Math.max(tmpList[idx].createCount, tmpList[idx + 1].createCount) + 1,
    						createCost,
    						mergeGrid: tmpList[idx].mergeGrid + tmpList[idx + 1].mergeGrid,
    						columnStart: tmpList[idx].columnStart,
    						columnEnd: tmpList[idx + 1].columnEnd
    					});

    					tmpList[idx + 1].resultCost = createCost;
    					totalCreateCost += createCost;
    					canCreate = canCreate ? createCost < MAX_CAN_CREATE_COST : false;
    				}
    			}

    			if (idx === tmpList.length - 1) {
    				resultList[createCountIdx].push(Object.assign({}, tmpList[idx]));
    			}
    		}

    		return [resultList, totalCreateCost, canCreate];
    	}

    	const writable_props = ['items'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CardListComponent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('items' in $$props) $$invalidate(2, items = $$props.items);
    	};

    	$$self.$capture_state = () => ({
    		CardComponent,
    		items,
    		searchMinCost,
    		spreadItems,
    		junretsu,
    		totalCreateCost,
    		tmpList
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(2, items = $$props.items);
    		if ('totalCreateCost' in $$props) $$invalidate(0, totalCreateCost = $$props.totalCreateCost);
    		if ('tmpList' in $$props) $$invalidate(1, tmpList = $$props.tmpList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*items*/ 4) {
    			$$invalidate(1, [tmpList, totalCreateCost] = searchMinCost(items), tmpList, ($$invalidate(0, totalCreateCost), $$invalidate(2, items)));
    		}
    	};

    	return [totalCreateCost, tmpList, items];
    }

    class CardListComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { items: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardListComponent",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*items*/ ctx[2] === undefined && !('items' in props)) {
    			console.warn("<CardListComponent> was created without expected prop 'items'");
    		}
    	}

    	get items() {
    		throw new Error("<CardListComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<CardListComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\SelectListComponent.svelte generated by Svelte v3.46.4 */

    const file$1 = "src\\SelectListComponent.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (10:8) {#each [...Array(8).keys()] as idx}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*idx*/ ctx[2] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*idx*/ ctx[2] + 1;
    			option.value = option.__value;
    			add_location(option, file$1, 10, 10, 307);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(10:8) {#each [...Array(8).keys()] as idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let label;
    	let t1;
    	let div0;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = [...Array(8).keys()];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			label = element("label");
    			label.textContent = "アイテム数";
    			t1 = space();
    			div0 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(label, "class", "label");
    			attr_dev(label, "for", "item-count");
    			add_location(label, file$1, 6, 4, 100);
    			attr_dev(select, "name", "item-count");
    			attr_dev(select, "id", "item-count");
    			attr_dev(select, "class", "svelte-1v8674a");
    			if (/*itemCount*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[1].call(select));
    			add_location(select, file$1, 8, 6, 185);
    			attr_dev(div0, "class", "select svelte-1v8674a");
    			add_location(div0, file$1, 7, 4, 157);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$1, 5, 2, 75);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$1, 4, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, label);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*itemCount*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Array*/ 0) {
    				each_value = [...Array(8).keys()];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*itemCount, Array*/ 1) {
    				select_option(select, /*itemCount*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SelectListComponent', slots, []);
    	let { itemCount } = $$props;
    	const writable_props = ['itemCount'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SelectListComponent> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		itemCount = select_value(this);
    		$$invalidate(0, itemCount);
    	}

    	$$self.$$set = $$props => {
    		if ('itemCount' in $$props) $$invalidate(0, itemCount = $$props.itemCount);
    	};

    	$$self.$capture_state = () => ({ itemCount });

    	$$self.$inject_state = $$props => {
    		if ('itemCount' in $$props) $$invalidate(0, itemCount = $$props.itemCount);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [itemCount, select_change_handler];
    }

    class SelectListComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { itemCount: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectListComponent",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*itemCount*/ ctx[0] === undefined && !('itemCount' in props)) {
    			console.warn("<SelectListComponent> was created without expected prop 'itemCount'");
    		}
    	}

    	get itemCount() {
    		throw new Error("<SelectListComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemCount(value) {
    		throw new Error("<SelectListComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.4 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let cardlist;
    	let updating_items;
    	let t;
    	let selectlist;
    	let updating_itemCount;
    	let current;

    	function cardlist_items_binding(value) {
    		/*cardlist_items_binding*/ ctx[2](value);
    	}

    	let cardlist_props = {};

    	if (/*items*/ ctx[1] !== void 0) {
    		cardlist_props.items = /*items*/ ctx[1];
    	}

    	cardlist = new CardListComponent({ props: cardlist_props, $$inline: true });
    	binding_callbacks.push(() => bind(cardlist, 'items', cardlist_items_binding));

    	function selectlist_itemCount_binding(value) {
    		/*selectlist_itemCount_binding*/ ctx[3](value);
    	}

    	let selectlist_props = {};

    	if (/*itemCount*/ ctx[0] !== void 0) {
    		selectlist_props.itemCount = /*itemCount*/ ctx[0];
    	}

    	selectlist = new SelectListComponent({ props: selectlist_props, $$inline: true });
    	binding_callbacks.push(() => bind(selectlist, 'itemCount', selectlist_itemCount_binding));

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(cardlist.$$.fragment);
    			t = space();
    			create_component(selectlist.$$.fragment);
    			attr_dev(main, "class", "svelte-h9gl72");
    			add_location(main, file, 21, 0, 471);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(cardlist, main, null);
    			append_dev(main, t);
    			mount_component(selectlist, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const cardlist_changes = {};

    			if (!updating_items && dirty & /*items*/ 2) {
    				updating_items = true;
    				cardlist_changes.items = /*items*/ ctx[1];
    				add_flush_callback(() => updating_items = false);
    			}

    			cardlist.$set(cardlist_changes);
    			const selectlist_changes = {};

    			if (!updating_itemCount && dirty & /*itemCount*/ 1) {
    				updating_itemCount = true;
    				selectlist_changes.itemCount = /*itemCount*/ ctx[0];
    				add_flush_callback(() => updating_itemCount = false);
    			}

    			selectlist.$set(selectlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cardlist.$$.fragment, local);
    			transition_in(selectlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cardlist.$$.fragment, local);
    			transition_out(selectlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(cardlist);
    			destroy_component(selectlist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let items;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let itemCount = 5;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function cardlist_items_binding(value) {
    		items = value;
    		($$invalidate(1, items), $$invalidate(0, itemCount));
    	}

    	function selectlist_itemCount_binding(value) {
    		itemCount = value;
    		$$invalidate(0, itemCount);
    	}

    	$$self.$capture_state = () => ({ CardList: CardListComponent, SelectList: SelectListComponent, itemCount, items });

    	$$self.$inject_state = $$props => {
    		if ('itemCount' in $$props) $$invalidate(0, itemCount = $$props.itemCount);
    		if ('items' in $$props) $$invalidate(1, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*itemCount*/ 1) {
    			$$invalidate(1, items = [...Array(itemCount).keys()].map(i => {
    				let j = i + 1;

    				return {
    					id: [i],
    					name: ["射撃ダメージ増加V" + j],
    					cost: j,
    					createCount: 0,
    					createCost: 0,
    					mergeGrid: 1,
    					columnStart: 0,
    					columnEnd: 0
    				};
    			}));
    		}
    	};

    	return [itemCount, items, cardlist_items_binding, selectlist_itemCount_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
