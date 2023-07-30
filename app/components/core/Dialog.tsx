/* eslint-disable @typescript-eslint/no-unused-vars */
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react'
import * as React from "react";

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}  

type IndexData = {
    token?: string;
    user: {
        email?: string;
    }
};

/*
 * Simple Dialog box that we use for modal windows...
 */

export default function Dialog({isOpen, setIsOpen, handleClose, title, children}: any) {
    function closeModal() {
        handleClose()
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }
    //window.scrollTo(0, 0)
    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <HeadlessDialog as="div" className="relative z-10" onClose={() => closeModal()}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                </Transition.Child>                        
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <HeadlessDialog.Panel className="w-full max-w-5xl transform overflow-auto rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <HeadlessDialog.Title
                                    as="h3"
                                    className="text-xl font-medium leading-6 text-blue-500"
                                >
                                    <div className="float-right">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={closeModal}
                                        >
                                            X
                                        </button>
                                    </div>
                                    {title}
                                </HeadlessDialog.Title>
                                <div className="m-4 p-4">
                                    <div className="border-0 border-t-2 border-t-blue-400">
                                        {children}
                                    </div>
                                </div>                                
                            </HeadlessDialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </HeadlessDialog>
        </Transition>                    
    );
}

/*
<div 
    className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8"
    onClick={closeModal}
>
</div>
<div class="p-4 bg-white rounded-t-[10px] flex-1">
    <div class="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8"></div>
    <div class="max-w-md mx-auto">
        <h2 id="radix-:R3dmbaH1:" class="font-medium mb-4">Drawer for React.</h2>
        <p class="text-gray-600 mb-2">This component can be used as a Dialog replacement on mobile and tablet devices.</p>
        <p class="text-gray-600 mb-2">It comes unstyled and has gesture-driven animations.</p>
    </div>
</div>
*/