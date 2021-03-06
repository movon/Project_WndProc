.486                                      ; enable 80486 processor assembly
.model flat, stdcall                      ; flat memory model, stdcall calling convention (more on that later)
option casemap :none                      ; code is case sensitive



include \masm32\include\windows.inc
include \masm32\include\kernel32.inc
include \masm32\include\user32.inc
include \masm32\include\gdi32.inc
includelib \masm32\lib\gdi32.lib
includelib \masm32\lib\user32.lib
includelib \masm32\lib\kernel32.lib



.const

VEL_X				 equ 8
VEL_Y				 equ 8
RECT_WIDTH			 equ 30
RECT_HEIGHT			 equ 20
WINDOW_WIDTH		 equ 800
WINDOW_HEIGHT		 equ 600
MAIN_TIMER_ID		 equ 0
MAIN_TIMING_INTERVAL equ 20
GREEN_COLOR			 equ 0ff0000h

.data

RectWidth       DB      30
RectHeight      DB      20
PlayerX			DWORD   400
PlayerY			DWORD   400
ClassName       DB      "TheClass", 0
windowTitle     DB      "A Game!", 0

.code

DrawRectangle	PROC, x:DWORD, y:DWORD, h:DWORD, w:DWORD, hdc:HDC, brush:HBRUSH
	LOCAL rectangle:RECT
	mov eax, x
	mov rectangle.left, eax
	add eax, w
	mov rectangle.right, eax

	mov eax, y
	mov rectangle.top, eax
	add eax, h
	mov rectangle.bottom, eax

	invoke FillRect, hdc, addr rectangle, brush
	ret
DrawRectangle ENDP

ProjectWndProc  PROC,   hWnd:HWND, message:UINT, wParam:WPARAM, lParam:LPARAM
    local paint:PAINTSTRUCT
    local hdc:HDC
    local brushcolouring:HBRUSH


	cmp message, WM_PAINT
	je painting
	cmp message, WM_CLOSE
	je closing
	cmp message, WM_TIMER
	je timing
	jmp OtherInstances


    closing:
    invoke ExitProcess, 0

    painting:
	; Paint the player as a rectangle

    invoke  BeginPaint,     hWnd,   addr paint
    mov hdc, eax
    invoke GetStockObject,  DC_BRUSH
    mov brushcolouring, eax
    invoke SetDCBrushColor, hdc, GREEN_COLOR

    invoke DrawRectangle, PlayerX, PlayerY, RectHeight, RectWidth, hdc, brushcolouring
    invoke EndPaint, hWnd, addr paint

	ret


	movement:
	;Check each key and move accordingly

    invoke GetAsyncKeyState, VK_LEFT
    cmp eax, 0
    jne moveleft
    invoke GetAsyncKeyState, VK_RIGHT
    cmp eax, 0
    jne moveright
    checkupdown:
    invoke GetAsyncKeyState, VK_UP
    cmp eax, 0
    jne moveup
    invoke GetAsyncKeyState, VK_DOWN
    cmp eax, 0
    jne movedown

	jmp check_borders

moveleft:
    mov RectHeight, RECT_HEIGHT
    mov RectWidth, RECT_WIDTH
    mov eax, PlayerX
    sub eax, VEL_X
    mov PlayerX,    eax
    jmp checkupdown
moveright:
    mov RectHeight, RECT_HEIGHT
    mov RectWidth, RECT_WIDTH
    mov eax, PlayerX
    add eax, VEL_X
    mov PlayerX, eax
    jmp checkupdown
movedown:
    mov RectHeight, RECT_WIDTH
    mov RectWidth, RECT_HEIGHT
    mov eax, PlayerY
    add eax, VEL_Y
    mov PlayerY, eax
    jmp check_borders
moveup:
    mov RectHeight, RECT_WIDTH
    mov RectWidth, RECT_HEIGHT
    mov eax, PlayerY
    sub eax, VEL_X
    mov PlayerY, eax
    jmp check_borders


check_borders:
    cmp PlayerY, 600
    jge BottomBorder
    cmp PlayerY, 0
    jle TopBorder
    cmp PlayerX, 800
    jge RightBorder
    cmp PlayerX, 0
    jle LeftBorder
    jmp endmovement
BottomBorder:
    mov eax, 0
    mov PlayerY, eax
    jmp endmovement
TopBorder:
    mov eax, 600
    mov PlayerY, eax
    jmp endmovement
RightBorder:
    mov eax, 0
    mov PlayerX, eax
    jmp endmovement
LeftBorder:
    mov eax, 800
    mov PlayerX, eax
    jmp endmovement


endmovement:
	ret

timing:
	; Send the redraw signal
    invoke InvalidateRect, hWnd, NULL, TRUE

	cmp wParam, MAIN_TIMER_ID
	je movement
    ret
OtherInstances:
	; Let the default window procedure process this message
    invoke DefWindowProc, hWnd, message, wParam, lParam
    ret

ProjectWndProc  ENDP

main PROC
	LOCAL wndcls:WNDCLASSA ; Class struct for the window
	LOCAL hWnd:HWND ;Handle to the window
	LOCAL msg:MSG
	invoke RtlZeroMemory, addr wndcls, SIZEOF wndcls ;Empty the window class
	mov eax, offset ClassName
	mov wndcls.lpszClassName, eax ;Set the class name
	invoke GetStockObject, BLACK_BRUSH
	mov wndcls.hbrBackground, eax ;Set the background color as black
	mov eax, ProjectWndProc
	mov wndcls.lpfnWndProc, eax ;Set the procedure that handles the window messages
	invoke RegisterClass, addr wndcls ;Register the class
	invoke CreateWindowEx, WS_EX_COMPOSITED, addr ClassName, addr windowTitle, WS_SYSMENU, 100, 100, WINDOW_WIDTH, WINDOW_HEIGHT, 0, 0, 0, 0 ;Create the window
	mov hWnd, eax ;Save the handle
	invoke ShowWindow, eax, SW_SHOW ;Show it
	invoke SetTimer, hWnd, MAIN_TIMER_ID, MAIN_TIMING_INTERVAL, NULL ;Set the repaint timer

	msgLoop:
	invoke GetMessage, addr msg, hWnd, 0, 0 ;Retrieve the messages from the window
	invoke DispatchMessage, addr msg ;Dispatches a message to the window procedure
	jmp msgLoop
	ret
main ENDP
end main