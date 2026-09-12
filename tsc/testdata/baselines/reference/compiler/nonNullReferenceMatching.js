//// [tests/cases/compiler/nonNullReferenceMatching.ts] ////

//// [nonNullReferenceMatching.ts]
type ElementRef = (element: HTMLElement | null) => void;

type ThumbProps = {
    elementRef?: ElementRef;
}

type ComponentProps = {
    thumbYProps?: ThumbProps;
    thumbXProps: ThumbProps;
}

class Component {
    props!: ComponentProps;
    public thumbYElementRef = (ref: HTMLElement | null) => {
        typeof (this.props.thumbYProps as!).elementRef === 'function' && (this.props.thumbYProps as!).elementRef(ref);

        typeof ((this.props.thumbYProps as!).elementRef) === 'function' && (this.props.thumbYProps as!).elementRef(ref);

        typeof ((((this.props).thumbYProps as!).elementRef) as!) === 'function' && (this.props.thumbYProps as!).elementRef(ref);

        typeof this.props.thumbXProps.elementRef === 'function' && this.props.thumbXProps.elementRef(ref);

        typeof this.props.thumbXProps.elementRef === 'function' && (this.props).thumbXProps.elementRef(ref);

        typeof this.props.thumbXProps.elementRef === 'function' && (this.props.thumbXProps).elementRef(ref);

        typeof this.props.thumbXProps.elementRef === 'function' && ((((this.props) as!).thumbXProps) as!).elementRef(ref);

        typeof (this.props.thumbXProps).elementRef === 'function' && ((((this.props) as!).thumbXProps) as!).elementRef(ref);

        typeof ((this.props as!).thumbXProps as!).elementRef === 'function' && ((((this.props) as!).thumbXProps) as!).elementRef(ref);
    };
}

//// [nonNullReferenceMatching.js]
"use strict";
class Component {
    constructor() {
        this.thumbYElementRef = (ref) => {
            typeof (this.props.thumbYProps).elementRef === 'function' && (this.props.thumbYProps).elementRef(ref);
            typeof ((this.props.thumbYProps).elementRef) === 'function' && (this.props.thumbYProps).elementRef(ref);
            typeof ((((this.props).thumbYProps).elementRef)) === 'function' && (this.props.thumbYProps).elementRef(ref);
            typeof this.props.thumbXProps.elementRef === 'function' && this.props.thumbXProps.elementRef(ref);
            typeof this.props.thumbXProps.elementRef === 'function' && (this.props).thumbXProps.elementRef(ref);
            typeof this.props.thumbXProps.elementRef === 'function' && (this.props.thumbXProps).elementRef(ref);
            typeof this.props.thumbXProps.elementRef === 'function' && ((((this.props)).thumbXProps)).elementRef(ref);
            typeof (this.props.thumbXProps).elementRef === 'function' && ((((this.props)).thumbXProps)).elementRef(ref);
            typeof ((this.props).thumbXProps).elementRef === 'function' && ((((this.props)).thumbXProps)).elementRef(ref);
        };
    }
}
