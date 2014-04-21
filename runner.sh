for i in `seq 1 1000000`
do
    ./$1 $2 $3
    notify-send "$1 on $3 terminated"
done

